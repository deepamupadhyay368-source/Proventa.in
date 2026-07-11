import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

// GET: Returns all active proactive recommendations
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock proactive recommendations with structured impact/confidence scores
    const recommendations = [
      {
        id: 'rec_credit_review',
        title: 'Execute Credit Limit Review: Alpha Logistics',
        description: 'Alpha Logistics average payment delay is rising. We recommend adjusting credit terms to Net-15.',
        impact: 'Reduce Default Credit Risk exposure',
        confidenceScore: 94,
        status: 'ACTIVE'
      },
      {
        id: 'rec_stale_sync',
        title: 'Stale Integration Sync: QuickBooks Online',
        description: 'No fresh data received from QuickBooks Online connection for 3 days.',
        impact: 'Improve Data Freshness index to > 98%',
        confidenceScore: 88,
        status: 'ACTIVE'
      },
      {
        id: 'rec_collections_warning',
        title: 'Outstanding Receivables Escalate Warning',
        description: 'Invoice #10293 is outstanding for 90+ days. Recommend creating a collections task.',
        impact: 'Accelerate DSO collections lifecycle',
        confidenceScore: 95,
        status: 'ACTIVE'
      }
    ];

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('Recommendations GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Approves and triggers action on a recommendation
export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    // Require CREDIT_MANAGER role clearance to approve AI suggestions
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { id, title } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Recommendation ID required' }, { status: 400 });
    }

    // Automatically trigger collaborative task execution matching this recommendation action!
    await db.taskItem.create({
      data: {
        organizationId: session!.organizationId!,
        title: `AI triggered task: ${title || id}`,
        description: `Triggered from Proactive AI Recommendations panel approval: ${id}`,
        status: 'OPEN'
      }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'RECOMMENDATION_APPROVED',
      `Approved and triggered action for AI Recommendation: ${title || id}`
    );

    return NextResponse.json({ success: true, message: 'Recommendation approved and task assigned.' });
  } catch (error: any) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
