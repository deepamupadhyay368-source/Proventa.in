import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'proventa-super-secret-key-12345!';

export const dynamic = 'force-dynamic';

// GET: Verifies the magic link token and signs the user in
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Magic link verification token missing.' }, { status: 400 });
    }

    // Verify JWT magic link token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Magic link has expired or is invalid.' }, { status: 400 });
    }

    if (decoded.type !== 'magic-link') {
      return NextResponse.json({ error: 'Invalid token scope' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: decoded.email },
      include: { organization: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Associated user account not found.' }, { status: 404 });
    }

    // Set session cookie
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });

    await logEvent(user.id, user.email, 'MAGIC_LINK_LOGIN', 'User authenticated using passwordless Magic Link.');

    // Redirect to dashboard page
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error: any) {
    console.error('Magic Link validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Requests a new Magic Link email token
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration attacks
      return NextResponse.json({ success: true, message: 'Magic link sent if email exists.' });
    }

    // Create token expiring in 15 minutes
    const token = jwt.sign(
      { email: user.email, type: 'magic-link' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const magicLinkUrl = `${new URL(request.url).origin}/api/auth/magic-link?token=${token}`;

    await logEvent(user.id, user.email, 'MAGIC_LINK_REQUESTED', 'Requested secure Magic Link passwordless token.');

    // In a real environment, we would email this link. For local sandbox, we return it in the JSON response!
    return NextResponse.json({
      success: true,
      message: 'Magic link generated successfully.',
      link: magicLinkUrl // Exposed in response for sandbox testing
    });

  } catch (error: any) {
    console.error('Magic Link request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
