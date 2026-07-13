import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const pendingCookie = cookieStore.get('proventa_mfa_pending')?.value;

    if (!pendingCookie) {
      return NextResponse.json({ error: 'Verification session expired. Please sign in again.' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(pendingCookie, 'base64').toString('utf8'));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }

    if (Date.now() > payload.exp) {
      cookieStore.delete('proventa_mfa_pending');
      return NextResponse.json({ error: 'Verification code expired. Please sign in again.' }, { status: 400 });
    }

    if (payload.otp !== token) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Set active session cookie
    await setSession({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    });

    // Clear mfa pending cookie
    cookieStore.set('proventa_mfa_pending', '', { maxAge: 0, path: '/' });

    try {
      await logEvent(payload.userId, payload.email, 'LOGIN', 'User logged in successfully after Email OTP verification.');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      }
    });

  } catch (error: any) {
    console.error('Verify login OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
