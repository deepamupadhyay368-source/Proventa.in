// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// ─── GET /api/onboarding/progress ─────────────────────────────────────────────
// Returns the current onboarding step booleans for the authenticated org.
// If no record exists yet, one is created with all steps set to false.

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = session;

    // Upsert: create if not found, otherwise return existing
    const onboardingStep = await db.onboardingStep.upsert({
      where: { organizationId: organizationId || "" || "" },
      create: {
        organizationId,
        profileDone: false,
        gstLinked: false,
        bankLinked: false,
        firstAssessment: false,
        teamInvited: false,
        dismissed: false,
      },
      update: {}, // no-op update — just fetch existing
    });

    return NextResponse.json({
      profileDone: onboardingStep.profileDone,
      gstLinked: onboardingStep.gstLinked,
      bankLinked: onboardingStep.bankLinked,
      firstAssessment: onboardingStep.firstAssessment,
      teamInvited: onboardingStep.teamInvited,
      dismissed: onboardingStep.dismissed,
    });
  } catch (err: unknown) {
    console.error('[GET /api/onboarding/progress]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/onboarding/progress ────────────────────────────────────────────
// Accepts a partial payload of step booleans and/or `dismiss: true`.
// Only the fields present in the request body are updated.
// `dismiss: true` is a shorthand that marks every step as complete.

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = session;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Build the update payload — only include fields that were explicitly provided
    const updateData: Record<string, boolean> = {};

    if (body.dismiss === true) {
      // Shorthand: mark all steps complete and dismiss the checklist
      updateData.profileDone = true;
      updateData.gstLinked = true;
      updateData.bankLinked = true;
      updateData.firstAssessment = true;
      updateData.teamInvited = true;
      updateData.dismissed = true;
    } else {
      // Granular update — only touch provided fields
      const booleanFields = [
        'profileDone',
        'gstLinked',
        'bankLinked',
        'firstAssessment',
        'teamInvited',
        'dismissed',
      ] as const;

      for (const field of booleanFields) {
        if (typeof body[field] === 'boolean') {
          updateData[field] = body[field] as boolean;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Upsert: create the record if it doesn't exist, then apply the update
    const updated = await db.onboardingStep.upsert({
      where: { organizationId: organizationId || "" || "" },
      create: {
        organizationId,
        profileDone: updateData.profileDone ?? false,
        gstLinked: updateData.gstLinked ?? false,
        bankLinked: updateData.bankLinked ?? false,
        firstAssessment: updateData.firstAssessment ?? false,
        teamInvited: updateData.teamInvited ?? false,
        dismissed: updateData.dismissed ?? false,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      profileDone: updated.profileDone,
      gstLinked: updated.gstLinked,
      bankLinked: updated.bankLinked,
      firstAssessment: updated.firstAssessment,
      teamInvited: updated.teamInvited,
      dismissed: updated.dismissed,
    });
  } catch (err: unknown) {
    console.error('[POST /api/onboarding/progress]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
