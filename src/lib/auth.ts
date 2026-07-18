import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./auth-utils";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string | null;
}

// Re-export for backwards compatibility with any other files using this
export { hashPassword, verifyPassword };

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
