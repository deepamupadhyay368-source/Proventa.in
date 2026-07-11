import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getTenantDEK, decryptWithDEK } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const company = await db.companyProfile.findUnique({
      where: { id },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        litigations: true,
        documents: true
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Zero-Trust security validation check
    if (company.organizationId !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden. Cross-tenant access denied.' }, { status: 403 });
    }

    // Decrypt sensitive fields for secure client display using tenant DEK
    const dek = await getTenantDEK(session.organizationId!);
    company.cin = decryptWithDEK(company.cin || '', dek);
    company.gstin = decryptWithDEK(company.gstin || '', dek);
    company.pan = decryptWithDEK(company.pan || '', dek);

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Company details retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
