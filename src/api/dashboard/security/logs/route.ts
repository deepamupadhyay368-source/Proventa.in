import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    // Require AUDITOR role or higher to access security audit logs
    const guard = await guardEndpoint(session, 'AUDITOR');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const logs = await db.auditLog.findMany({
      where: {
        OR: [
          { userId: session!.userId },
          { userEmail: session!.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Audit logs API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
