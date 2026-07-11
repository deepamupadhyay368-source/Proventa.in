import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET: Returns all active sessions for the currently logged in user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await db.session.findMany({
      where: {
        userId: session.userId,
        isRevoked: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Sessions query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Revokes/Terminates a specific session ID (Remote Logout)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Revoke the session in database
    await db.session.update({
      where: { id: sessionId },
      data: { isRevoked: true }
    });

    await logEvent(
      session.userId,
      session.email,
      'SESSION_REVOKED',
      `Remotely terminated user session: ${sessionId}`
    );

    return NextResponse.json({ success: true, message: 'Session revoked successfully.' });
  } catch (error: any) {
    console.error('Session revoke error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
