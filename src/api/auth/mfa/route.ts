import { NextResponse } from 'next/server';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { db } from '@/lib/db';
import { getSession, setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET: Generate TOTP secret and return provisioning URI for Google Authenticator / 1Password
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Proventa Credit Intelligence',
      label: session.email,
      secret
    });

    // Temporarily save secret in user profile until verified
    await db.user.update({
      where: { id: session.userId },
      data: { mfaSecret: secret }
    });

    return NextResponse.json({ secret, otpauthUrl });
  } catch (error: any) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Verify and enable TOTP MFA, or authenticate an MFA login step
export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'MFA verification token required' }, { status: 400 });
    }

    const session = await getSession();

    // Case 1: Session exists (user is enabling MFA in dashboard settings)
    if (session) {
      const user = await db.user.findUnique({ where: { id: session.userId } });
      if (!user || !user.mfaSecret) {
        return NextResponse.json({ error: 'MFA setup not initialized.' }, { status: 400 });
      }

      const verification = verifySync({ secret: user.mfaSecret, token });
      const isValid = verification ? verification.valid : false;
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid MFA verification code. Please try again.' }, { status: 400 });
      }

      // Generate backup recovery codes (10 codes of 8 characters)
      const recoveryCodesArray = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
      const hashedRecoveryCodes = recoveryCodesArray.map(code => 
        crypto.createHash('sha256').update(code).digest('hex')
      );

      await db.user.update({
        where: { id: session.userId },
        data: { 
          mfaEnabled: true,
          recoveryCodes: JSON.stringify(hashedRecoveryCodes)
        }
      });

      await logEvent(user.id, user.email, 'MFA_ENABLED', 'Successfully configured and enabled Multi-Factor Authentication.');

      return NextResponse.json({ 
        success: true, 
        message: 'MFA enabled successfully.',
        recoveryCodes: recoveryCodesArray 
      });
    }

    // Case 2: No active session (MFA verification step during login flow)
    if (!email) {
      return NextResponse.json({ error: 'Email required for MFA login verification' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json({ error: 'MFA not configured for this account' }, { status: 400 });
    }

    const verification = verifySync({ secret: user.mfaSecret, token });
    const isValid = verification ? verification.valid : false;
    if (!isValid) {
      // Also check recovery codes
      const hashedInput = crypto.createHash('sha256').update(token).digest('hex');
      const recoveryList: string[] = JSON.parse(user.recoveryCodes || '[]');
      const codeIndex = recoveryList.indexOf(hashedInput);

      if (codeIndex !== -1) {
        // Remove used recovery code
        recoveryList.splice(codeIndex, 1);
        await db.user.update({
          where: { id: user.id },
          data: { recoveryCodes: JSON.stringify(recoveryList) }
        });
        await logEvent(user.id, user.email, 'MFA_RECOVERY_CODE_USED', 'Bypassed login MFA challenge using a recovery code.');
      } else {
        await logEvent(user.id, email, 'MFA_LOGIN_FAILED', 'Failed MFA login challenge.');
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
      }
    }

    // Create session
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });

    await logEvent(user.id, user.email, 'LOGIN', 'User logged in successfully after MFA verification.');

    return NextResponse.json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
    });

  } catch (error: any) {
    console.error('MFA post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
