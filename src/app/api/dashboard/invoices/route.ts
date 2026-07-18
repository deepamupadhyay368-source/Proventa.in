// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysDiff(dateA: Date, dateB: Date): number {
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
}

function computeAgingBucket(dueDate: Date, status: string): { bucket: string; daysOverdue: number } {
  if (status === 'PAID' || status === 'CANCELLED') {
    return { bucket: 'CURRENT', daysOverdue: 0 };
  }
  const now = new Date();
  const daysOverdue = Math.max(0, daysDiff(now, dueDate));
  let bucket = 'CURRENT';
  if (daysOverdue > 0 && daysOverdue <= 30) bucket = '30';
  else if (daysOverdue > 30 && daysOverdue <= 60) bucket = '60';
  else if (daysOverdue > 60) bucket = '90PLUS';
  return { bucket, daysOverdue };
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    const where: Record<string, unknown> = { organizationId: orgId };
    if (customerId) where.customerId = customerId;

    const invoices = await db.invoice.findMany({
      where,
      include: { customer: { select: { id: true, name: true, riskScore: true, riskTier: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Auto-update overdue status & aging buckets in bulk
    const overdueIds: string[] = [];
    const enriched = invoices.map((inv) => {
      const { bucket, daysOverdue } = computeAgingBucket(new Date(inv.dueDate), inv.status);
      const isOverdue =
        inv.status !== 'PAID' &&
        inv.status !== 'CANCELLED' &&
        inv.status !== 'DRAFT' &&
        new Date(inv.dueDate) < now;

      if (isOverdue && inv.status !== 'OVERDUE') {
        overdueIds.push(inv.id);
      }

      return {
        ...inv,
        daysOverdue,
        agingBucket: bucket,
        status: isOverdue && inv.status !== 'OVERDUE' ? 'OVERDUE' : inv.status,
      };
    });

    // Batch update overdue invoices
    if (overdueIds.length > 0) {
      await db.invoice.updateMany({
        where: { id: { in: overdueIds } },
        data: { status: 'OVERDUE' },
      });
    }

    // Summary calculations
    const now2 = new Date();
    const startOfMonth = new Date(now2.getFullYear(), now2.getMonth(), 1);

    let totalAR = 0;
    let overdueAR = 0;
    let paidThisMonth = 0;
    const agingBreakdown = { current: 0, d30: 0, d60: 0, d90plus: 0 };

    for (const inv of enriched) {
      if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
        const outstanding = inv.totalAmount - inv.paidAmount;
        totalAR += outstanding;

        if (inv.status === 'OVERDUE') {
          overdueAR += outstanding;
        }

        // Aging breakdown
        switch (inv.agingBucket) {
          case 'CURRENT': agingBreakdown.current += outstanding; break;
          case '30': agingBreakdown.d30 += outstanding; break;
          case '60': agingBreakdown.d60 += outstanding; break;
          case '90PLUS': agingBreakdown.d90plus += outstanding; break;
        }
      }

      if (inv.status === 'PAID' && inv.paidDate && new Date(inv.paidDate) >= startOfMonth) {
        paidThisMonth += inv.paidAmount;
      }
    }

    return NextResponse.json({
      invoices: enriched,
      summary: { totalAR, overdueAR, paidThisMonth, agingBreakdown },
    });
  } catch (error) {
    console.error('GET /invoices error:', error);
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
    const { customerId, invoiceNumber, description, amount, taxRate, dueDate, notes } = body;

    if (!customerId || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'customerId, invoiceNumber, amount, and dueDate are required' },
        { status: 400 },
      );
    }

    // Verify customer belongs to org
    const customer = await db.customer.findFirst({ where: { id: customerId, organizationId: orgId } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const parsedAmount = parseFloat(amount);
    const parsedTaxRate = taxRate ? parseFloat(taxRate) : 0;
    const taxAmount = parsedAmount * (parsedTaxRate / 100);
    const totalAmount = parsedAmount + taxAmount;

    const invoice = await db.invoice.create({
      data: {
        organizationId: orgId,
        customerId,
        invoiceNumber: invoiceNumber.trim(),
        description: description?.trim() || null,
        amount: parsedAmount,
        taxAmount,
        totalAmount,
        dueDate: new Date(dueDate),
        status: 'DRAFT',
        notes: notes?.trim() || null,
        paidAmount: 0,
      },
    });

    // Update customer usedCredit
    await db.customer.update({
      where: { id: customerId },
      data: { usedCredit: { increment: totalAmount } },
    });

    // Create alert if customer is high risk
    if (customer.riskScore < 400) {
      await db.alert.create({
        data: {
          organizationId: orgId,
          customerId,
          type: 'LIMIT_BREACH',
          severity: 'HIGH',
          title: `High-Risk Invoice Created: ${invoiceNumber}`,
          message: `Invoice #${invoiceNumber} for ₹${totalAmount.toLocaleString('en-IN')} has been created for high-risk customer "${customer.name}" (score: ${customer.riskScore}). Credit exposure now ₹${(customer.usedCredit + totalAmount).toLocaleString('en-IN')}.`,
          isRead: false,
          isResolved: false,
        },
      });
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('POST /invoices error:', error);
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
    const { id, status, paidAmount, paidDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const existing = await db.invoice.findFirst({
      where: { id, organizationId: orgId },
      include: { customer: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (paidDate) updateData.paidDate = new Date(paidDate);

    // Compute new aging bucket
    const targetStatus = status || existing.status;
    const { bucket } = computeAgingBucket(new Date(existing.dueDate), targetStatus);
    updateData.agingBucket = bucket;

    const updated = await db.invoice.update({ where: { id }, data: updateData });

    // If marking as PAID: update customer payment behavior
    if (status === 'PAID' && existing.status !== 'PAID') {
      const wasLate = new Date(paidDate || new Date()) > new Date(existing.dueDate);
      if (wasLate) {
        await db.customer.update({
          where: { id: existing.customerId },
          data: {
            payLateCount: { increment: 1 },
            usedCredit: { decrement: existing.totalAmount - existing.paidAmount },
          },
        });
      } else {
        await db.customer.update({
          where: { id: existing.customerId },
          data: {
            payOnTimeCount: { increment: 1 },
            usedCredit: { decrement: existing.totalAmount - existing.paidAmount },
          },
        });
      }
    }

    // Create notification if status changes to OVERDUE
    if (status === 'OVERDUE' && existing.status !== 'OVERDUE') {
      await db.notification.create({
        data: {
          organizationId: orgId,
          title: `Invoice Overdue: #${existing.invoiceNumber}`,
          message: `Invoice #${existing.invoiceNumber} for customer "${existing.customer.name}" is now overdue. Amount: ₹${existing.totalAmount.toLocaleString('en-IN')}`,
          type: 'WARNING',
        },
      });

      // Create an alert as well
      await db.alert.create({
        data: {
          organizationId: orgId,
          customerId: existing.customerId,
          type: 'OVERDUE',
          severity: existing.totalAmount > 500000 ? 'CRITICAL' : 'HIGH',
          title: `Invoice #${existing.invoiceNumber} Overdue`,
          message: `Invoice #${existing.invoiceNumber} for ₹${existing.totalAmount.toLocaleString('en-IN')} from customer "${existing.customer.name}" is now overdue.`,
          isRead: false,
          isResolved: false,
        },
      });
    }

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    console.error('PUT /invoices error:', error);
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
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const existing = await db.invoice.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await db.invoice.delete({ where: { id } });

    // Revert customer usedCredit if invoice wasn't paid
    if (existing.status !== 'PAID') {
      await db.customer.update({
        where: { id: existing.customerId },
        data: { usedCredit: { decrement: existing.totalAmount - existing.paidAmount } },
      });
    }

    return NextResponse.json({ success: true, message: `Invoice #${existing.invoiceNumber} deleted` });
  } catch (error) {
    console.error('DELETE /invoices error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
