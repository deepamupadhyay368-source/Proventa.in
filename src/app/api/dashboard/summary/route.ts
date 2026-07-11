import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getTenantDEK, decryptWithDEK } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true }
    });

    // Fetch all companies under this organization
    const companies = await db.companyProfile.findMany({
      where: { organizationId: session.organizationId },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        litigations: true
      }
    });

    // Separate into own company (first company created by the organization) and portfolio companies
    // For local ease, let's treat the company that matches the organization name or the oldest company as the primary one,
    // and the rest as the portfolio suppliers/customers.
    const primaryCompany = companies.length > 0 ? companies[0] : null;
    const portfolioCompanies = companies.length > 1 ? companies.slice(1) : [];

    // Calculate aggregated metrics
    const totalCompaniesTracked = portfolioCompanies.length;
    
    let totalExposure = 0;
    let highRiskCount = 0;
    let totalLitigations = 0;
    let sumCreditScore = 0;
    let scoreCount = 0;

    portfolioCompanies.forEach(c => {
      const assess = c.assessments[0];
      if (assess) {
        totalExposure += assess.recommendedLimit;
        sumCreditScore += assess.creditScore;
        scoreCount++;
        if (assess.riskScore > 50) {
          highRiskCount++;
        }
      }
      totalLitigations += c.litigations.length;
    });

    const averageCreditScore = scoreCount > 0 ? Math.round(sumCreditScore / scoreCount) : 710;

    // Fetch notifications
    const notifications = await db.notification.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Fetch audit logs
    const auditLogs = await db.auditLog.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { userEmail: session.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Retrieve tenant's unique Data Encryption Key (DEK)
    const dek = await getTenantDEK(session.organizationId!);

    return NextResponse.json({
      user,
      primaryCompany: primaryCompany ? {
        id: primaryCompany.id,
        name: primaryCompany.name,
        cin: decryptWithDEK(primaryCompany.cin || '', dek),
        gstin: decryptWithDEK(primaryCompany.gstin || '', dek),
        pan: decryptWithDEK(primaryCompany.pan || '', dek),
        annualRevenue: primaryCompany.annualRevenue,
        industry: primaryCompany.industry,
        assessment: primaryCompany.assessments[0] || null
      } : null,
      portfolioMetrics: {
        totalCompaniesTracked,
        totalExposure,
        highRiskCount,
        totalLitigations,
        averageCreditScore
      },
      portfolioCompanies: portfolioCompanies.map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        annualRevenue: c.annualRevenue,
        assessment: c.assessments[0] || null,
        litigationsCount: c.litigations.length
      })),
      notifications,
      auditLogs
    });
  } catch (error) {
    console.error('Dashboard summary retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
