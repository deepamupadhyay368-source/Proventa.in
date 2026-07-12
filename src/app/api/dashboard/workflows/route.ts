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

// POST: Creates a new workflow rule OR triggers execution of an existing one
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if we are triggering a rule execution
    if (body.ruleId) {
      const rule = await db.workflowRule.findUnique({
        where: { id: body.ruleId, organizationId: session.organizationId }
      });

      if (!rule) {
        return NextResponse.json({ error: 'Workflow rule not found' }, { status: 404 });
      }

      // Create a simulated workflow execution run
      const run = await db.workflowRun.create({
        data: {
          ruleId: rule.id,
          status: 'SUCCESS',
          executionHistory: JSON.stringify([
            { step: 'Event Trigger Fired', timestamp: new Date().toISOString(), trigger: rule.trigger },
            { step: 'Conditions Validated', timestamp: new Date().toISOString(), matched: true },
            { step: 'Action Resolved', timestamp: new Date().toISOString(), action: JSON.parse(rule.actions).type },
            { step: 'Complete', timestamp: new Date().toISOString(), status: 'SUCCESS' }
          ])
        }
      });

      // Spawn a dynamic in-app notification based on the triggered action
      const actionType = JSON.parse(rule.actions).type;
      await db.notification.create({
        data: {
          organizationId: session.organizationId,
          title: `Workflow: ${rule.name}`,
          message: `Triggered ${rule.trigger} action outcome: ${actionType} completed successfully.`,
          type: 'SUCCESS'
        }
      });

      await logEvent(
        session.userId,
        session.email,
        'WORKFLOW_EXECUTED',
        `Executed workflow rule: "${rule.name}" -> status SUCCESS`
      );

      return NextResponse.json({ success: true, run });
    }

    // Otherwise, create a new rule (Admin check applies here)
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { name, trigger, actions } = body;
    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'Missing workflow parameters' }, { status: 400 });
    }

    const rule = await db.workflowRule.create({
      data: {
        organizationId: session.organizationId,
        name,
        trigger,
        actions: typeof actions === 'string' ? actions : JSON.stringify(actions)
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'WORKFLOW_CREATED',
      `Created no-code workflow rule: ${name}`
    );

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    console.error('Workflows POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Deletes an automation workflow rule
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    // Delete rule runs first to maintain reference integrity
    await db.workflowRun.deleteMany({
      where: { ruleId: id }
    });

    const rule = await db.workflowRule.delete({
      where: { id, organizationId: session!.organizationId! }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'WORKFLOW_DELETED',
      `Deleted workflow rule: "${rule.name}"`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Workflows DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
