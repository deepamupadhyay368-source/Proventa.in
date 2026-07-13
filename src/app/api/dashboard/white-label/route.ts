import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let config = await db.brandConfig.findUnique({
      where: { organizationId: session.organizationId }
    });

    if (!config) {
      config = await db.brandConfig.create({
        data: {
          organizationId: session.organizationId,
          companyName: 'My Company',
          primaryColor: '#0B1F3A',
          accentColor: '#2563EB',
          logoUrl: '',
          emailFromName: 'My Company Support',
          customDomain: ''
        }
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('White label fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const config = await db.brandConfig.upsert({
      where: { organizationId: session.organizationId },
      update: {
        companyName: data.companyName,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        logoUrl: data.logoUrl,
        emailFromName: data.emailFromName,
        customDomain: data.customDomain
      },
      create: {
        organizationId: session.organizationId,
        companyName: data.companyName || 'My Company',
        primaryColor: data.primaryColor || '#0B1F3A',
        accentColor: data.accentColor || '#2563EB',
        logoUrl: data.logoUrl || '',
        emailFromName: data.emailFromName || '',
        customDomain: data.customDomain || ''
      }
    });

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('White label update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
