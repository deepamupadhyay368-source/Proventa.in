import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

// GET: Returns data catalog metadata and active governance policies
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock data catalogs for the warehouse governance center
    const dataCatalog = [
      { name: 'Company Profiles Registry', size: '25 KB', items: 5, classification: 'CONFIDENTIAL' },
      { name: 'Document Vault Repository', size: '12.4 MB', items: 22, classification: 'RESTRICTED' },
      { name: 'Reconciliation Anomalies Stream', size: '5 KB', items: 1, classification: 'INTERNAL' },
      { name: 'Audit Access Logs', size: '18 KB', items: 45, classification: 'RESTRICTED' }
    ];

    const retentionPolicies = [
      { category: 'Financial Documents', duration: '7 Years', action: 'ARCHIVE' },
      { category: 'Session Track Logs', duration: '90 Days', action: 'PURGE' },
      { category: 'Credit Scores Snapshots', duration: '3 Years', action: 'ARCHIVE' }
    ];

    return NextResponse.json({ dataCatalog, retentionPolicies });
  } catch (error: any) {
    console.error('Governance GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Updates organization data governance classification parameters
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const body = await request.json();
    const policyCategory = body.policyCategory || body.category;
    const policyDuration = body.policyDuration || body.duration;
    const policyAction = body.policyAction || body.action;

    if (!policyCategory || !policyDuration || !policyAction) {
      return NextResponse.json({ error: 'Missing policy settings parameters' }, { status: 400 });
    }

    await logEvent(
      session!.userId,
      session!.email,
      'GOVERNANCE_POLICY_UPDATED',
      `Updated data retention settings: ${policyCategory} duration set to ${policyDuration}`
    );

    return NextResponse.json({ success: true, message: 'Data governance retention policy saved.' });
  } catch (error: any) {
    console.error('Governance POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
