import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, googleId } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing profile information' }, { status: 400 });
    }

    // Check if user exists
    let user = await db.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    let action = 'GOOGLE_LOGIN';
    let details = 'User logged in via Google SSO.';

    if (!user) {
      // Automatic sign up for Google SSO
      action = 'GOOGLE_SIGNUP';
      details = 'User registered and signed up via Google SSO.';

      // Create organization and user in a transaction
      const result = await db.$transaction(async (prisma) => {
        const org = await prisma.organization.create({
          data: {
            name: `${name}'s Organization`,
            planType: 'FREE',
            subscriptionStatus: 'FREE_TRIAL',
          },
        });

        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash: 'GOOGLE_SSO_USER_' + (googleId || Date.now().toString()),
            role: 'ADMIN',
            organizationId: org.id,
          },
        });

        await prisma.notification.create({
          data: {
            organizationId: org.id,
            title: 'Welcome to Proventa!',
            message: 'Your account has been securely initialized via Google SSO. Complete onboarding to activate tools.',
            type: 'SUCCESS',
          },
        });

        return { user: newUser, org };
      });

      user = {
        ...result.user,
        organization: result.org,
      } as any;
    }

    // Set session cookie
    await setSession({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
      organizationId: user!.organizationId,
    });

    await logEvent(user!.id, user!.email, action, details);

    return NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        organizationId: user!.organizationId,
        organizationName: user!.organization?.name,
      }
    });
  } catch (error: any) {
    console.error('Google SSO API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
