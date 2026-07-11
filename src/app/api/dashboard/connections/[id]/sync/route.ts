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

    // Require CREDIT_MANAGER role clearance to sync data
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Create a running sync job
    const syncJob = await db.syncJob.create({
      data: {
        connectionId,
        status: 'RUNNING',
        recordsImported: 0
      }
    });

    // Simulate standard job processing delay / integration data pull in background
    // Update the sync status to SUCCESS after updating the records imported
    const importedRecordsCount = Math.floor(Math.random() * 250) + 50;

    await db.$transaction([
      db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'SUCCESS',
          recordsImported: importedRecordsCount,
          completedAt: new Date()
        }
      }),
      db.financialConnection.update({
        where: { id: connectionId },
        data: {
          lastSync: new Date(),
          status: 'CONNECTED',
          healthScore: 100
        }
      })
    ]);

    await logEvent(
      session.userId,
      session.email,
      'SYNC_COMPLETED',
      `Synchronized ${connection.name}. Imported ${importedRecordsCount} financial ledger records.`
    );

    return NextResponse.json({
      success: true,
      message: 'Sync job executed successfully.',
      recordsImported: importedRecordsCount
    });

  } catch (error: any) {
    console.error('Connection Sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
