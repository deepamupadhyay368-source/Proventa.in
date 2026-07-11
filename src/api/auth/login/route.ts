import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      await logEvent(null, email, 'LOGIN_FAILED', 'Failed login attempt: non-existent email.');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Enforce lockout check
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return NextResponse.json({ 
        error: `Account locked due to multiple failed attempts. Please try again after ${user.lockoutUntil.toLocaleTimeString()}.` 
      }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const attempts = user.failedLogins + 1;
      const lockoutTime = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.user.update({
        where: { id: user.id },
        data: {
          failedLogins: attempts,
          lockoutUntil: lockoutTime
        }
      });

      await logEvent(user.id, email, 'LOGIN_FAILED', `Failed login attempt. Attempt ${attempts} of 5.`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Success: Reset security thresholds
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockoutUntil: null
      }
    });

    // Check if Multi-Factor Authentication is active
    if (user.mfaEnabled) {
      await logEvent(user.id, user.email, 'MFA_CHALLENGE', 'MFA authentication challenge presented.');
      return NextResponse.json({ mfaRequired: true, email: user.email });
    }

    // Set session cookie
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    await logEvent(user.id, user.email, 'LOGIN', 'User logged in successfully.');

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
