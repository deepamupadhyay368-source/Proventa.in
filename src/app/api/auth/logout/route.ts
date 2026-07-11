import { NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export async function POST() {
  try {
    const session = await getSession();
    if (session) {
      await logEvent(session.userId, session.email, 'LOGOUT', 'User logged out.');
    }
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
