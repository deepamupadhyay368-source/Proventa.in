import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { guardEndpoint } from '@/lib/tenant';
import { getTenantDEK, generateDEK, encryptDEK, encryptWithDEK, decryptWithDEK } from '@/lib/encryption';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// POST: Rotates the organization's unique Data Encryption Key (DEK)
export async function POST() {
  try {
    const session = await getSession();
    
    // Require ADMIN role or higher to rotate cryptographic keys
    const guard = await guardEndpoint(session, 'ADMIN');
    if (!guard.authorized) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const orgId = session!.organizationId!;
    
    // 1. Fetch old DEK key
    const oldDEK = await getTenantDEK(orgId);

    // 2. Fetch all companies belonging to this organization
    const companies = await db.companyProfile.findMany({
      where: { organizationId: orgId }
    });

    // 3. Generate a brand new DEK and encrypt it with the KEK
    const newDEK = generateDEK();
    const { encryptedDEK, iv } = encryptDEK(newDEK);

    // 4. Perform data re-encryption in a safe transaction
    await db.$transaction(async (prisma) => {
      // Re-encrypt every company profile in the tenant
      for (const comp of companies) {
        const decryptedCin = decryptWithDEK(comp.cin || '', oldDEK);
        const decryptedGstin = decryptWithDEK(comp.gstin || '', oldDEK);
        const decryptedPan = decryptWithDEK(comp.pan || '', oldDEK);

        const newCin = encryptWithDEK(decryptedCin, newDEK);
        const newGstin = encryptWithDEK(decryptedGstin, newDEK);
        const newPan = encryptWithDEK(decryptedPan, newDEK);

        await prisma.companyProfile.update({
          where: { id: comp.id },
          data: {
            cin: newCin,
            gstin: newGstin,
            pan: newPan
          }
        });
      }

      // 5. Save the new encrypted DEK back to the Organization
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          encryptedDEK,
          dekIV: iv,
          keyRotatedAt: new Date()
        }
      });
    });

    await logEvent(
      session!.userId,
      session!.email,
      'KEY_ROTATION_SUCCESS',
      `Rotated organization Data Encryption Key (DEK). Re-encrypted ${companies.length} records.`
    );

    return NextResponse.json({ 
      success: true, 
      message: `Data Encryption Key rotated successfully. Re-encrypted ${companies.length} corporate profiles.` 
    });

  } catch (error: any) {
    console.error('Key rotation failed:', error);
    return NextResponse.json({ error: 'Key rotation failed: internal error.' }, { status: 500 });
  }
}
