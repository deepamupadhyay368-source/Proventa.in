import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db';

const SESSION_COOKIE_NAME = 'proventa_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours absolute timeout
const IDLE_EXPIRY_MS = 30 * 60 * 1000; // 30 Minutes idle timeout

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string | null;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // Enforce password requirements check (min 14 characters)
  if (password.length < 14) {
    throw new Error('Password must be at least 14 characters long.');
  }
  return bcrypt.hash(password, 10);
}

/**
 * Verify password using bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
}

/**
 * Creates a stateless session for a user and sets the cookie
 */
export async function setSession(payload: SessionPayload) {
  // Convert payload to a stateless token to avoid SQLite read-only issues on Vercel
  const statelessToken = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + SESSION_EXPIRY_MS
  })).toString('base64');

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, statelessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(Date.now() + SESSION_EXPIRY_MS),
    path: '/',
  });
}

/**
 * Retrieves the current session from the stateless cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!payload || !payload.userId || payload.exp < Date.now()) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Revokes the current session and deletes the cookie
 */
export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
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
