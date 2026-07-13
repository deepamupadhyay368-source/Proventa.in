import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/services/stripe';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.organizationId) {
      return NextResponse.json({ error: 'No organization linked to account.' }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
      select: {
        id: true,
        name: true,
        planType: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
    }

    const billingRecords = await db.billingRecord.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate trial days remaining if on trial
    let trialDaysRemaining: number | null = null;
    if (org.subscriptionStatus === 'TRIAL' && org.trialEndsAt) {
      const now = new Date();
      const diff = org.trialEndsAt.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Fetch usage counts for plan gate display
    const [assessmentCount, customerCount, invoiceCount] = await Promise.all([
      db.creditAssessment.count({ where: { organizationId: session.organizationId } }),
      db.customer.count({ where: { organizationId: session.organizationId } }),
      db.invoice.count({ where: { organizationId: session.organizationId } }),
    ]);

    return NextResponse.json({
      plan: org.planType || 'FREE',
      status: org.subscriptionStatus || 'ACTIVE',
      trialDaysRemaining,
      trialEndsAt: org.trialEndsAt,
      orgName: org.name,
      usage: {
        assessments: assessmentCount,
        customers: customerCount,
        invoices: invoiceCount,
      },
      records: billingRecords,
    });
  } catch (error) {
    console.error('[BILLING GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch billing information.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.organizationId) {
      return NextResponse.json({ error: 'No organization linked to account.' }, { status: 400 });
    }

    const body = await req.json();

    // ── Action: Cancel subscription ──────────────────────────────────────────
    if (body.action === 'cancel') {
      await db.organization.update({
        where: { id: session.organizationId },
        data: { subscriptionStatus: 'CANCELLED' },
      });

      await db.billingRecord.create({
        data: {
          organizationId: session.organizationId,
          status: 'REFUNDED',
          amount: 0,
          description: 'Subscription Cancelled',
          currency: 'INR',
        },
      });

      return NextResponse.json({ success: true, message: 'Subscription has been cancelled.' });
    }

    // ── Action: Activate 14-day free trial ───────────────────────────────────
    if (body.action === 'activate_trial') {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      await db.organization.update({
        where: { id: session.organizationId },
        data: {
          subscriptionStatus: 'TRIAL',
          planType: 'PRO',
          trialEndsAt,
        },
      });

      await db.billingRecord.create({
        data: {
          organizationId: session.organizationId,
          status: 'PAID',
          amount: 0,
          description: '14-day Free Trial Activated — Growth Plan',
          currency: 'INR',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Your 14-day Growth Plan trial has been activated.',
        trialEndsAt,
      });
    }

    // ── Action: Plan upgrade → Stripe checkout ───────────────────────────────
    if (body.plan && (body.plan === 'PRO' || body.plan === 'ENTERPRISE')) {
      const checkoutUrl = await createCheckoutSession(
        session.userId,
        session.organizationId,
        body.plan as 'PRO' | 'ENTERPRISE'
      );

      return NextResponse.json({ success: true, checkoutUrl });
    }

    return NextResponse.json({ error: 'Invalid request body. Provide plan, or action (cancel | activate_trial).' }, { status: 400 });
  } catch (error) {
    console.error('[BILLING POST ERROR]', error);
    return NextResponse.json({ error: 'Billing action failed.' }, { status: 500 });
  }
}
