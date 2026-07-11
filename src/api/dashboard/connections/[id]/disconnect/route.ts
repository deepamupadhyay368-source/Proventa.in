import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { guardEndpoint } from '@/lib/tenant';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connectionId = params.id;

    // Verify connection exists and belongs to organization
    const connection = await db.financialConnection.findFirst({
      where: {
        id: connectionId,
        organizationId: session.organizationId
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection profile not found' }, { status: 404 });
    }

    // Require CREDIT_MANAGER role clearance to remove integrations
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Delete connection and logs via transaction cascade
    await db.financialConnection.delete({
      where: { id: connectionId }
    });

    await logEvent(
      session.userId,
      session.email,
      'CONNECTION_DISCONNECTED',
      `Revoked and deleted integration: ${connection.name}`
    );

    return NextResponse.json({
      success: true,
      message: `Disconnected ${connection.name} successfully.`
    });

  } catch (error: any) {
    console.error('Connection disconnect error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
