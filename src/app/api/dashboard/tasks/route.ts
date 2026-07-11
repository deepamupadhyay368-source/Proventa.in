import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET: Returns all tasks for the organization
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await db.taskItem.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Creates a new task
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, dueDate, companyId } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await db.taskItem.create({
      data: {
        organizationId: session.organizationId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        companyId,
        status: 'OPEN'
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'TASK_CREATED',
      `Created and assigned task ticket: ${title}`
    );

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
