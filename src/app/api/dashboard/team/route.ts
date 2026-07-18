// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';
import { sendEmail } from '@/lib/services/notifications';

// ─── GET /api/dashboard/team ──────────────────────────────────────────────────
// Returns active members in the organization and all pending invites.

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = session;

    // Fetch all users in the same org
    const members = await db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // lastLogin may exist on the model — include if available
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch pending (not yet accepted) invites
    const pendingInvites = await db.teamInvite.findMany({
      where: {
        organizationId,
        accepted: false,
        expiresAt: { gt: new Date() }, // only non-expired invites
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      members,
      pendingInvites,
    });
  } catch (err: unknown) {
    console.error('[GET /api/dashboard/team]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/dashboard/team ─────────────────────────────────────────────────
// Creates a new team invite for the given email + role.

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, userId: invitedByUserId } = session;

    let body: { email?: string; role?: string; message?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { email, role, message } = body;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }
    if (!role || typeof role !== 'string') {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const allowedRoles = ['ADMIN', 'ANALYST', 'VIEWER', 'AUDITOR'];
    if (!allowedRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if the user already exists in this org
    const existingUser = await db.user.findFirst({
      where: { email: normalizedEmail, organizationId },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already belongs to your organization' },
        { status: 409 }
      );
    }

    // Check for an existing non-expired, non-accepted invite
    const existingInvite = await db.teamInvite.findFirst({
      where: {
        organizationId,
        email: normalizedEmail,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 409 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create the invite record
    const invite = await db.teamInvite.create({
      data: {
        organizationId,
        email: normalizedEmail,
        role: role.toUpperCase(),
        token,
        expiresAt,
        accepted: false,
        invitedById: invitedByUserId,
      },
    });

    // Fetch the organization name for the email
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.proventa.ai';
    const joinLink = `${baseUrl}/join?token=${token}`;

    // Send invite email (fire-and-forget — don't block the response)
    sendEmail({
      to: normalizedEmail,
      subject: `You've been invited to join ${org?.name ?? 'Proventa'} on Proventa`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="display: inline-block; background: linear-gradient(135deg, #0B1F3A, #2563EB); color: #fff; font-weight: 900; font-size: 1.4rem; padding: 0.5rem 1.25rem; border-radius: 10px; letter-spacing: -0.02em;">
              Proventa
            </div>
          </div>
          <div style="background: #ffffff; border-radius: 16px; padding: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(11,31,58,0.06);">
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #0B1F3A; margin: 0 0 1rem; letter-spacing: -0.02em;">
              You've been invited!
            </h2>
            <p style="color: #6b7280; margin: 0 0 1rem; line-height: 1.6;">
              You've been invited to join <strong style="color: #111827;">${org?.name ?? 'your organization'}</strong> on Proventa as an <strong style="color: #2563EB;">${role.toUpperCase()}</strong>.
            </p>
            ${message ? `<p style="color: #6b7280; margin: 0 0 1.5rem; padding: 0.875rem 1rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid #2563EB; line-height: 1.6; font-style: italic;">"${message}"</p>` : ''}
            <a href="${joinLink}" style="display: inline-block; background: #0B1F3A; color: #ffffff; font-weight: 700; padding: 0.875rem 2rem; border-radius: 10px; text-decoration: none; font-size: 0.9rem; letter-spacing: 0.02em; margin-bottom: 1.5rem;">
              Accept Invitation →
            </a>
            <p style="color: #9ca3af; font-size: 0.8rem; margin: 0; line-height: 1.5;">
              This invitation expires in 7 days. If you didn't expect this, you can safely ignore this email.<br>
              Or copy this link: <span style="word-break: break-all;">${joinLink}</span>
            </p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 0.75rem; margin-top: 1.5rem;">
            Proventa · SME Credit Intelligence Platform
          </p>
        </div>
      `,
    }).catch(emailErr => {
      console.error('[Team Invite] Failed to send email:', emailErr);
    });

    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/dashboard/team]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/dashboard/team ───────────────────────────────────────────────
// ?userId=  → deactivate user (set role to INACTIVE)
// ?inviteId= → delete pending invite

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, userId: requestingUserId } = session;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";
    const inviteId = searchParams.get("inviteId") || "";

    if (!userId && !inviteId) {
      return NextResponse.json(
        { error: 'Either userId or inviteId query param is required' },
        { status: 400 }
      );
    }

    // ── Deactivate a user ──
    if (userId) {
      // Prevent self-deactivation
      if (userId === requestingUserId) {
        return NextResponse.json(
          { error: 'You cannot deactivate your own account' },
          { status: 400 }
        );
      }

      // Confirm target user belongs to same org
      const targetUser = await db.user.findFirst({
        where: { id: userId, organizationId },
      });
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found in your organization' },
          { status: 404 }
        );
      }

      // Mark as INACTIVE
      await db.user.update({
        where: { id: userId },
        data: { role: "USER" },
      });

      return NextResponse.json({ success: true, message: 'User deactivated successfully' });
    }

    // ── Delete an invite ──
    if (inviteId) {
      const invite = await db.teamInvite.findFirst({
        where: { id: inviteId, organizationId },
      });
      if (!invite) {
        return NextResponse.json(
          { error: 'Invite not found' },
          { status: 404 }
        );
      }

      await db.teamInvite.delete({ where: { id: inviteId } });

      return NextResponse.json({ success: true, message: 'Invite cancelled successfully' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[DELETE /api/dashboard/team]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
