import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await db.supportTicket.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Support ticket retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message, priority } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        subject,
        message,
        priority: priority || 'MEDIUM',
        status: 'OPEN'
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'SUPPORT_TICKET_CREATE',
      `Filed customer support ticket: ${subject}`
    );

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
