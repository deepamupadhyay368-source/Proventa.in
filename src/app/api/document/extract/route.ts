import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { extractDocumentOCR } from '@/lib/services/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { textPayload, companyId } = await request.json();

    if (!textPayload) {
      return NextResponse.json({ error: 'textPayload is required' }, { status: 400 });
    }

    // Call GPT-4o OCR Extraction
    const extractionResult = await extractDocumentOCR(textPayload);

    // Save it to the database as a CompanyEvent if a companyId is provided
    if (companyId) {
      // Ensure company belongs to this org
      const company = await db.companyProfile.findFirst({
        where: { id: companyId, organizationId: session.organizationId }
      });

      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const event = await db.companyEvent.create({
        data: {
          companyId,
          eventType: 'COMPLIANCE',
          description: extractionResult.summary || 'Extracted document intelligence via AI',
          aiSummary: JSON.stringify(extractionResult),
        }
      });

      return NextResponse.json({ success: true, event, extractionResult });
    }

    return NextResponse.json({ success: true, extractionResult });

  } catch (error: any) {
    console.error('Document Extract API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
