import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateEventSummary } from '@/lib/services/openai';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, eventType, details } = body;

    if (!eventType || !details) {
      return NextResponse.json(
        { error: 'eventType and details are required' },
        { status: 400 }
      );
    }

    // Generate AI Summary for the event
    const aiSummary = await generateEventSummary(eventType, details);

    const simulatedEvent = {
      id: `evt_${Date.now()}`,
      customerId,
      eventType,
      details,
      aiSummary,
      timestamp: new Date().toISOString(),
    };

    // Optionally create an alert for the customer if a customer ID was provided
    if (customerId) {
      const customer = await db.customer.findFirst({
        where: { id: customerId, organizationId: session.organizationId }
      });
      if (customer) {
        await db.alert.create({
          data: {
            organizationId: session.organizationId,
            customerId: customer.id,
            type: 'SCORE_DROP', // mapping arbitrary events to available alert types
            severity: 'MEDIUM',
            title: `Company Event: ${eventType}`,
            message: `Event: ${details}. AI Analysis: ${aiSummary}`,
          }
        });
      }
    }

    return NextResponse.json({ event: simulatedEvent }, { status: 201 });
  } catch (error) {
    console.error('POST /monitoring error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
