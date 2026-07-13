import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sources = await db.dataLakeSource.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sources });
  } catch (error: any) {
    console.error('DataLake GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'ADMIN', 'ANALYST');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const body = await request.json();
    const { name, sourceType, dataType, fileSize, recordsCount } = body;

    if (!name || !sourceType || !dataType) {
      return NextResponse.json({ error: 'Missing Data Lake parameters' }, { status: 400 });
    }

    const source = await db.dataLakeSource.create({
      data: {
        organizationId: session!.organizationId!,
        name,
        sourceType,
        dataType,
        status: 'ACTIVE',
        fileSize: fileSize || null,
        recordsCount: recordsCount || 0
      }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'DATALAKE_SOURCE_ADDED',
      `Registered new data lake source: ${name} (${dataType})`
    );

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    console.error('DataLake POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Source ID is required' }, { status: 400 });
    }

    const source = await db.dataLakeSource.delete({
      where: { id, organizationId: session!.organizationId! }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'DATALAKE_SOURCE_REMOVED',
      `Removed data lake source: ${source.name}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DataLake DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
