import { NextResponse } from 'next/server';
import { logEvent } from './logger';

export type UserRole = 
  | 'OWNER'
  | 'ADMIN'
  | 'CFO'
  | 'FINANCE_HEAD'
  | 'CREDIT_MANAGER'
  | 'CREDIT_ANALYST'
  | 'SALES'
  | 'ACCOUNTS'
  | 'AUDITOR'
  | 'COMPLIANCE_OFFICER'
  | 'VIEWER'
  | 'API_USER';

// Define standard role access hierarchies
const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 100,
  ADMIN: 90,
  CFO: 85,
  FINANCE_HEAD: 80,
  CREDIT_MANAGER: 75,
  CREDIT_ANALYST: 60,
  AUDITOR: 50,
  COMPLIANCE_OFFICER: 50,
  ACCOUNTS: 40,
  SALES: 30,
  API_USER: 20,
  VIEWER: 10
};

/**
 * Enforces strict tenant separation.
 * Compares the user session's organizationId with the resource's tenantId.
 * If they do not match, blocks access and logs a security event.
 */
export async function enforceTenantIsolation(
  sessionOrgId: string | null,
  targetOrgId: string,
  userId: string,
  userEmail: string
): Promise<boolean> {
  if (!sessionOrgId || !targetOrgId || sessionOrgId !== targetOrgId) {
    await logEvent(
      userId,
      userEmail,
      'SECURITY_BREACH_ATTEMPT',
      `Blocked cross-tenant access attempt. User Org: ${sessionOrgId || 'NONE'}, Target Org: ${targetOrgId}`
    );
    throw new Error('Access Forbidden: Cross-tenant data leakage prevented.');
  }
  return true;
}

/**
 * Validates if the user's role has the required clearance level (RBAC)
 */
export function checkRBACPermission(userRole: string, minimumRequiredRole: UserRole): boolean {
  const currentLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRequiredRole] || 10;
  return currentLevel >= requiredLevel;
}

/**
 * Endpoint guard helper for quick controller validation
 */
export async function guardEndpoint(
  session: { userId: string; email: string; role: string; organizationId: string | null } | null,
  minimumRole: UserRole,
  targetOrgId?: string
) {
  if (!session) {
    return { authorized: false, error: 'Unauthorized. Authentication session required.', status: 401 };
  }

  // 1. Validate role clearance
  const hasClearance = checkRBACPermission(session.role, minimumRole);
  if (!hasClearance) {
    await logEvent(
      session.userId,
      session.email,
      'UNAUTHORIZED_ROLE_ACCESS',
      `Blocked endpoint execution. Required: ${minimumRole}, User Role: ${session.role}`
    );
    return { authorized: false, error: `Forbidden. Minimum role required: ${minimumRole}`, status: 403 };
  }

  // 2. Validate tenant isolation if targeted
  if (targetOrgId) {
    try {
      await enforceTenantIsolation(session.organizationId, targetOrgId, session.userId, session.email);
    } catch (err: any) {
      return { authorized: false, error: err.message, status: 403 };
    }
  }

  return { authorized: true };
}
