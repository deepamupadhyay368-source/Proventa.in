import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// ─── GET /api/dashboard/exports ───────────────────────────────────────────────
// Query params:
//   ?type=portfolio  → companyProfiles + creditAssessments
//   ?type=customers  → all customers
//   ?type=invoices   → all invoices with customer data
//   ?type=alerts     → all alerts
//
// Responds with a JSON file download (Content-Disposition: attachment)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = session;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const allowedTypes = ['portfolio', 'customers', 'invoices', 'alerts'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid export type. Must be one of: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let exportData: unknown;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    switch (type) {
      // ── Portfolio: company profiles + their credit assessments ──
      case 'portfolio': {
        const profiles = await db.companyProfile.findMany({
          where: { organizationId },
          include: {
            creditAssessments: {
              orderBy: { createdAt: 'desc' },
              take: 5, // most recent 5 assessments per company
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        exportData = {
          exportType: 'portfolio',
          exportedAt: new Date().toISOString(),
          organizationId,
          totalCompanies: profiles.length,
          companies: profiles.map(p => ({
            id: p.id,
            companyName: p.companyName,
            gstin: p.gstin,
            pan: p.pan,
            industry: p.industry,
            annualRevenue: p.annualRevenue,
            employeeCount: p.employeeCount,
            registeredAt: p.createdAt,
            assessments: p.creditAssessments.map(a => ({
              id: a.id,
              creditScore: a.creditScore,
              riskLevel: a.riskLevel,
              recommendedLimit: a.recommendedLimit,
              assessedAt: a.createdAt,
            })),
          })),
        };
        filename = `proventa-portfolio-${timestamp}.json`;
        break;
      }

      // ── Customers ──
      case 'customers': {
        const customers = await db.customer.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
        });

        exportData = {
          exportType: 'customers',
          exportedAt: new Date().toISOString(),
          organizationId,
          totalCustomers: customers.length,
          customers: customers.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            gstin: c.gstin,
            creditLimit: c.creditLimit,
            outstandingBalance: c.outstandingBalance,
            riskScore: c.riskScore,
            status: c.status,
            createdAt: c.createdAt,
          })),
        };
        filename = `proventa-customers-${timestamp}.json`;
        break;
      }

      // ── Invoices ──
      case 'invoices': {
        const invoices = await db.invoice.findMany({
          where: { organizationId },
          include: {
            customer: {
              select: { id: true, name: true, email: true, gstin: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        exportData = {
          exportType: 'invoices',
          exportedAt: new Date().toISOString(),
          organizationId,
          totalInvoices: invoices.length,
          invoices: invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            currency: inv.currency,
            status: inv.status,
            dueDate: inv.dueDate,
            paidAt: inv.paidAt,
            issuedAt: inv.createdAt,
            customer: inv.customer
              ? {
                  id: inv.customer.id,
                  name: inv.customer.name,
                  email: inv.customer.email,
                  gstin: inv.customer.gstin,
                }
              : null,
          })),
        };
        filename = `proventa-invoices-${timestamp}.json`;
        break;
      }

      // ── Alerts ──
      case 'alerts': {
        const alerts = await db.alert.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
        });

        exportData = {
          exportType: 'alerts',
          exportedAt: new Date().toISOString(),
          organizationId,
          totalAlerts: alerts.length,
          alerts: alerts.map(a => ({
            id: a.id,
            type: a.type,
            severity: a.severity,
            title: a.title,
            message: a.message,
            isRead: a.isRead,
            resolvedAt: a.resolvedAt,
            createdAt: a.createdAt,
          })),
        };
        filename = `proventa-alerts-${timestamp}.json`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    // Serialize to pretty JSON
    const jsonBody = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(jsonBody, 'utf8').toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    console.error('[GET /api/dashboard/exports]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
