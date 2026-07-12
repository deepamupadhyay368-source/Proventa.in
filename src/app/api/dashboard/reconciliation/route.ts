import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

// GET: Returns all active reconciliation records and anomalies
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await db.reconciliationRecord.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const anomalies = records.filter(r => r.status === 'ANOMALY');

    return NextResponse.json({ records, anomalies });
  } catch (error: any) {
    console.error('Reconciliation GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Triggers a matching run and identifies reconciliation discrepancies
export async function POST() {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const orgId = session!.organizationId!;

    // Create 3 simulated reconciliation outcomes: 2 matched, 1 anomaly
    const outcomes = [
      {
        type: 'BANK_VS_LEDGER',
        sourceAmount: 15400.0,
        targetAmount: 15400.0,
        difference: 0.0,
        status: 'MATCHED'
      },
      {
        type: 'GST_VS_SALES',
        sourceAmount: 48920.0,
        targetAmount: 45200.0,
        difference: 3720.0,
        status: 'ANOMALY',
        anomalyReason: 'GST invoice GSTR-1 does not match accounting sales register.',
        suggestedResolution: 'Verify missing invoice inv_10293 from sales ledger.'
      },
      {
        type: 'ERP_VS_ACCOUNTING',
        sourceAmount: 92800.0,
        targetAmount: 92800.0,
        difference: 0.0,
        status: 'MATCHED'
      }
    ];

    const inserted = [];
    for (const out of outcomes) {
      const rec = await db.reconciliationRecord.create({
        data: {
          organizationId: orgId,
          type: out.type,
          sourceAmount: out.sourceAmount,
          targetAmount: out.targetAmount,
          difference: out.difference,
          status: out.status,
          anomalyReason: out.anomalyReason,
          suggestedResolution: out.suggestedResolution
        }
      });
      inserted.push(rec);
    }

    await logEvent(
      session!.userId,
      session!.email,
      'RECONCILIATION_RUN',
      `Executed reconciliation audit. Created ${inserted.length} match records.`
    );

    return NextResponse.json({ success: true, records: inserted });
  } catch (error: any) {
    console.error('Reconciliation POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Resolves a flagged reconciliation anomaly
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const record = await db.reconciliationRecord.update({
      where: { id, organizationId: session!.organizationId! },
      data: {
        status: 'RESOLVED',
        suggestedResolution: 'Manually verified and matched by Risk Officer.'
      }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'RECONCILIATION_RESOLVED',
      `Resolved reconciliation discrepancy: ${record.type} ($${record.difference})`
    );

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Reconciliation PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
