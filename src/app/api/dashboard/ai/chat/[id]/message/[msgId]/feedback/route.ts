import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string; msgId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, feedbackText } = await request.json();

    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating score (1-5) required' }, { status: 400 });
    }

    // Verify message exists and belongs to organization conversation
    const message = await db.aiMessage.findFirst({
      where: {
        id: params.msgId,
        conversationId: params.id,
        conversation: {
          organizationId: session.organizationId!
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Target message not found' }, { status: 404 });
    }

    // Save rating feedback
    await db.aiMessage.update({
      where: { id: params.msgId },
      data: {
        feedbackRating: rating,
        feedbackText: feedbackText || null
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'AI_FEEDBACK_SUBMITTED',
      `Registered user rating rating: ${rating} stars for message: ${params.msgId}`
    );

    return NextResponse.json({ success: true, message: 'Feedback logged successfully.' });

  } catch (error: any) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
