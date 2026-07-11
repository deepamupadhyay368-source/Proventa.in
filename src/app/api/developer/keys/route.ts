import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await db.apiKey.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('API key retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Key name is required' }, { status: 400 });
    }

    // Generate random API key
    const rawKey = 'prov_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await db.apiKey.create({
      data: {
        organizationId: session.organizationId,
        name,
        keyHash,
        status: 'ACTIVE'
      }
    });

    await logEvent(
      session.userId,
      session.email,
      'API_KEY_GENERATE',
      `Generated developer API key: ${name}`
    );

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        status: apiKey.status
      },
      rawKey // Return raw key only once
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const key = await db.apiKey.findUnique({ where: { id } });
    if (!key || key.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update status to REVOKED or delete
    await db.apiKey.delete({ where: { id } });

    await logEvent(
      session.userId,
      session.email,
      'API_KEY_REVOKE',
      `Revoked developer API key ID: ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key revocation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
