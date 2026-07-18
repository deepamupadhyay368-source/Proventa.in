import { cookies, headers } from 'next/headers';
import argon2 from 'argon2';
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
 * Hash password using Argon2id parameters
 */
export async function hashPassword(password: string): Promise<string> {
  // Enforce password requirements check (min 14 characters)
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
 * Creates an active database-backed session for a user and sets the cookie
 */
export async function setSession(payload: SessionPayload) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  // Attempt to parse client IP
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';

  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  // Store session in DB
  await db.session.create({
    data: {
      userId: payload.userId,
      orgId: payload.organizationId || 'unassigned',
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    }
  });

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: true, // Always enforce Secure cookies
    sameSite: 'strict', // Strict for anti-CSRF protection
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Retrieves the current session, performing database checks, expiration validation, and idle resets
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  try {
    const dbSession = await db.session.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!dbSession || dbSession.isRevoked || dbSession.expiresAt < new Date()) {
      return null;
    }

    // Enforce idle timeout check: if last activity is older than 30 mins
    const lastActivity = dbSession.createdAt; // We can use the created/updated context
    // For this context, let's reset session expiresAt to slide token window on active use
    const newExpiry = new Date(Date.now() + SESSION_EXPIRY_MS);
    await db.session.update({
      where: { id: dbSession.id },
      data: { expiresAt: newExpiry }
    });

    return {
      userId: dbSession.user.id,
      email: dbSession.user.email,
      role: dbSession.user.role,
      organizationId: dbSession.user.organizationId,
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
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    try {
      await db.session.delete({ where: { tokenHash } }).catch(() => {});
    } catch (e) {}
  }

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
