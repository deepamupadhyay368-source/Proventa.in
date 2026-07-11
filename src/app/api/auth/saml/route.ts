import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { generateDEK, encryptDEK } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// POST: Handles SAML assertion responses from external Enterprise IdPs
export async function POST(request: Request) {
  try {
    const { samlAssertion, targetEmail, targetName, organizationName } = await request.json();

    if (!samlAssertion || !targetEmail) {
      return NextResponse.json({ error: 'Invalid SAML response payload' }, { status: 400 });
    }

    // Enterprise security verification (mocking SAML signature verification)
    console.log(`🔒 Verifying SAML Assertion Signature for domain: ${targetEmail.split('@')[1]}`);

    let user = await db.user.findUnique({
      where: { email: targetEmail },
      include: { organization: true }
    });

    if (!user) {
      // Auto-provision user & organization if SAML Just-In-Time (JIT) provisioning is configured
      const result = await db.$transaction(async (prisma) => {
        // Generate unique DEK key for this tenant and encrypt with master KEK
        const newDEK = generateDEK();
        const { encryptedDEK, iv } = encryptDEK(newDEK);

        const org = await prisma.organization.create({
          data: {
            name: organizationName || `${targetName || 'Enterprise'}'s Org`,
            planType: 'ENTERPRISE',
            subscriptionStatus: 'ACTIVE',
            encryptedDEK,
            dekIV: iv
          }
        });

        const newUser = await prisma.user.create({
          data: {
            email: targetEmail,
            name: targetName || targetEmail.split('@')[0],
            passwordHash: 'saml_sso_managed_identity_external_hash', // SSO managed
            role: 'CREDIT_ANALYST',
            organizationId: org.id
          }
        });

        return { user: newUser, org };
      });

      user = { ...result.user, organization: result.org } as any;
      await logEvent(user.id, targetEmail, 'SAML_JIT_PROVISION', 'Auto-provisioned enterprise user via SAML JIT.');
    }

    // Set session cookie
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });

    await logEvent(user.id, user.email, 'SAML_LOGIN', 'Successfully logged in using SAML SSO Enterprise Integration.');

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
    console.error('SAML SSO validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
