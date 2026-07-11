import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

// GET: Returns all workflow rules and history logs
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await db.workflowRule.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const ruleIds = rules.map(r => r.id);

    const runs = await db.workflowRun.findMany({
      where: { ruleId: { in: ruleIds } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({ rules, runs });
  } catch (error: any) {
    console.error('Workflows GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Creates a new workflow rule
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { name, trigger, actions } = await request.json();
    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'Missing workflow parameters' }, { status: 400 });
    }

    const rule = await db.workflowRule.create({
      data: {
        organizationId: session!.organizationId!,
        name,
        trigger,
        actions: typeof actions === 'string' ? actions : JSON.stringify(actions)
      }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'WORKFLOW_CREATED',
      `Created no-code workflow rule: ${name}`
    );

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    console.error('Workflows POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
