import { db } from './db';

export async function logEvent(
  userId: string | null,
  userEmail: string | null,
  action: string,
  details: string,
  ipAddress?: string
) {
  try {
    return await db.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        details,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
