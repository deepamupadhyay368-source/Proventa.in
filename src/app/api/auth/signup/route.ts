import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { generateDEK, encryptDEK } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    const { name, email, password, orgName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 14) {
      return NextResponse.json({ error: 'Password must be at least 14 characters long.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password using Argon2id
    const passwordHash = await hashPassword(password);

    // Create organization and user in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Generate unique DEK key for this tenant and encrypt with master KEK
      const newDEK = generateDEK();
      const { encryptedDEK, iv } = encryptDEK(newDEK);

      // 1. Create Organization
      const org = await prisma.organization.create({
        data: {
          name: orgName || `${name}'s Organization`,
          planType: 'FREE',
          subscriptionStatus: 'FREE_TRIAL',
          encryptedDEK,
          dekIV: iv
        },
      });

      // 2. Create User linked to the Organization
      // If it is the first user, default their role to ADMIN
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'ADMIN',
          organizationId: org.id,
        },
      });

      // 3. Create default Welcome notification
      await prisma.notification.create({
        data: {
          organizationId: org.id,
          title: 'Welcome to Proventa!',
          message: 'Get started by completing your Company Onboarding wizard.',
          type: 'SUCCESS',
        },
      });

      return { user, org };
    });

    // Write audit log
    await logEvent(result.user.id, result.user.email, 'SIGNUP', 'User signed up and organization created.');

    // Set session cookie
    await setSession({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.org.id,
    });

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.user.organizationId,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
