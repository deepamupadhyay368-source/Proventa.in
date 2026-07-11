import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!plan || !['FREE', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan type selected' }, { status: 400 });
    }

    // Update organization plan type
    const updatedOrg = await db.organization.update({
      where: { id: session.organizationId },
      data: {
        planType: plan,
        subscriptionStatus: plan === 'FREE' ? 'FREE_TRIAL' : 'ACTIVE'
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'SUBSCRIPTION_UPGRADE',
      `Upgraded organization subscription plan type to: ${plan}`
    );

    // Create a notification for the organization
    await db.notification.create({
      data: {
        organizationId: session.organizationId,
        title: `Subscription Plan Updated: ${plan}`,
        message: `Your organization has successfully configured the ${plan} licensing structure limits.`,
        type: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
