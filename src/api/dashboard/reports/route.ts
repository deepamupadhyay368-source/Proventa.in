import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Returns executive credit risk reports metrics
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creditRiskReport = {
      overallRiskStatus: 'LOW',
      averageDsoDays: 32.5,
      dsoTargetDays: 30.0,
      totalOutstandingReceivables: 145000.0,
      agingMatrix: {
        current: 98000.0,      // 0-30 days
        thirtyToSixty: 28000.0, // 30-60 days
        sixtyToNinety: 14000.0, // 60-90 days
        ninetyPlus: 5000.0      // 90+ days
      },
      collectionsRatio: 96.5,
      gearingRatio: 1.2
    };

    return NextResponse.json({ creditRiskReport });
  } catch (error: any) {
    console.error('Reports GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
