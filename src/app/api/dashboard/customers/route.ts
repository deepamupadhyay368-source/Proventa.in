import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── Risk Score Computation ────────────────────────────────────────────────────
function computeRiskScore(data: {
  annualRevenue?: number | null;
  gstin?: string | null;
  pan?: string | null;
}): number {
  let score = 600; // base score

  // Revenue factor: up to +150 points
  if (data.annualRevenue) {
    if (data.annualRevenue >= 100_000_000) score += 150;      // ≥ 10 Cr
    else if (data.annualRevenue >= 50_000_000) score += 100;  // ≥ 5 Cr
    else if (data.annualRevenue >= 10_000_000) score += 60;   // ≥ 1 Cr
    else if (data.annualRevenue >= 1_000_000) score += 30;    // ≥ 10L
    else score += 10;
  }

  // Compliance deductions
  if (!data.gstin || data.gstin.trim() === '') score -= 50;
  if (!data.pan || data.pan.trim() === '') score -= 30;

  // Cap between 300 and 900
  return Math.max(300, Math.min(900, score));
}

function computeRiskTier(score: number): string {
  if (score >= 850) return 'AAA';
  if (score >= 800) return 'AA';
  if (score >= 750) return 'A';
  if (score >= 700) return 'BBB';
  if (score >= 650) return 'BB';
  if (score >= 550) return 'B';
  if (score >= 450) return 'C';
  return 'D';
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const customers = await db.customer.findMany({
      where: { organizationId: orgId },
      include: {
        invoices: true,
        alerts: { where: { isResolved: false } },
      },
      orderBy: { riskScore: 'desc' },
    });

    // Summary metrics
    const totalCustomers = customers.length;
    const avgRiskScore =
      totalCustomers > 0
        ? Math.round(customers.reduce((s, c) => s + c.riskScore, 0) / totalCustomers)
        : 0;

    const totalCreditExposed = customers.reduce((s, c) => s + c.usedCredit, 0);

    const now = new Date();
    let overdueCount = 0;
    for (const c of customers) {
      const hasOverdue = c.invoices.some(
        (inv) =>
          inv.status !== 'PAID' &&
          inv.status !== 'CANCELLED' &&
          new Date(inv.dueDate) < now,
      );
      if (hasOverdue) overdueCount++;
    }

    return NextResponse.json({
      customers,
      summary: { totalCustomers, avgRiskScore, totalCreditExposed, overdueCount },
    });
  } catch (error) {
    console.error('GET /customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const body = await req.json();
    const {
      name,
      email,
      phone,
      gstin,
      pan,
      industry,
      annualRevenue,
      creditLimit,
      notes,
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const riskScore = computeRiskScore({ annualRevenue, gstin, pan });
    const riskTier = computeRiskTier(riskScore);

    const customer = await db.customer.create({
      data: {
        organizationId: orgId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        gstin: gstin?.trim() || null,
        pan: pan?.trim() || null,
        industry: industry?.trim() || null,
        annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
        riskScore,
        riskTier,
        notes: notes?.trim() || null,
        status: 'ACTIVE',
      },
    });

    // Auto-create alert for high-risk customers (score < 400)
    if (riskScore < 400) {
      await db.alert.create({
        data: {
          organizationId: orgId,
          customerId: customer.id,
          type: 'SCORE_DROP',
          severity: 'HIGH',
          title: `High Risk Customer Added: ${customer.name}`,
          message: `New customer "${customer.name}" has a risk score of ${riskScore} (${riskTier}), which is below the acceptable threshold. Immediate review recommended.`,
          isRead: false,
          isResolved: false,
        },
      });
    }

    return NextResponse.json({ customer, riskScore, riskTier }, { status: 201 });
  } catch (error) {
    console.error('POST /customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const body = await req.json();
    const { id, name, email, phone, gstin, pan, industry, annualRevenue, creditLimit, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.customer.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Recompute risk score with updated data
    const riskScore = computeRiskScore({
      annualRevenue: annualRevenue ?? existing.annualRevenue,
      gstin: gstin ?? existing.gstin,
      pan: pan ?? existing.pan,
    });
    const riskTier = computeRiskTier(riskScore);

    const updated = await db.customer.update({
      where: { id },
      data: {
        name: name?.trim() ?? existing.name,
        email: email?.trim() ?? existing.email,
        phone: phone?.trim() ?? existing.phone,
        gstin: gstin?.trim() ?? existing.gstin,
        pan: pan?.trim() ?? existing.pan,
        industry: industry?.trim() ?? existing.industry,
        annualRevenue: annualRevenue !== undefined ? parseFloat(annualRevenue) : existing.annualRevenue,
        creditLimit: creditLimit !== undefined ? parseFloat(creditLimit) : existing.creditLimit,
        notes: notes?.trim() ?? existing.notes,
        status: status ?? existing.status,
        riskScore,
        riskTier,
      },
    });

    return NextResponse.json({ customer: updated });
  } catch (error) {
    console.error('PUT /customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.customer.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Cascade delete related records
    await db.alert.deleteMany({ where: { customerId: id } });
    await db.invoice.deleteMany({ where: { customerId: id } });
    await db.customer.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Customer "${existing.name}" deleted successfully` });
  } catch (error) {
    console.error('DELETE /customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
