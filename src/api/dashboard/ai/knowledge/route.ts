import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logEvent } from '@/lib/logger';
import { guardEndpoint } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

// GET: Returns all corporate knowledge base documents
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await db.knowledgeDocument.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Knowledge GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Adds a new document to the organization's knowledge base
export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    // Require CREDIT_MANAGER role clearance to publish knowledge base documents
    const guard = await guardEndpoint(session, 'CREDIT_MANAGER');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { title, content, category } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing document parameters' }, { status: 400 });
    }

    const doc = await db.knowledgeDocument.create({
      data: {
        organizationId: session!.organizationId!,
        title,
        content,
        category // POLICY, SOP, MANUAL
      }
    });

    await logEvent(
      session!.userId,
      session!.email,
      'KNOWLEDGE_DOC_PUBLISHED',
      `Published new knowledge base document: ${title} (${category})`
    );

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error('Knowledge POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
