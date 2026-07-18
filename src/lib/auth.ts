import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import argon2 from "argon2";
import { db } from "./db";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string | null;
}

/**
 * Hash password using Argon2id parameters
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 14) {
    throw new Error('Password must be at least 14 characters long.');
  }
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify password using Argon2id
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

/**
 * Retrieves the current session securely from NextAuth
 */
export async function getSession(): Promise<SessionPayload | null> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return null;

  return {
    userId: session.user.id,
    email: session.user.email as string,
    role: session.user.role || 'USER',
    organizationId: session.user.organizationId || null,
  };
}

/**
 * Retrieves the full context of the currently authenticated User
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { organization: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    };
  } catch (error) {
    return null;
  }
}
