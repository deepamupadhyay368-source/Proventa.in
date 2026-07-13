import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = session.organizationId;

    const { searchParams } = new URL(req.url);
    const rulesOnly = searchParams.get('rules') === 'true';

    if (rulesOnly) {
      const rules = await db.alertRule.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ rules });
    }

    const alerts = await db.alert.findMany({
      where: { organizationId: orgId },
      include: {
        customer: { select: { id: true, name: true, riskScore: true, riskTier: true } },
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    // Group by severity
    const bySeverity: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    let unresolvedCount = 0;
    let unreadCount = 0;

    for (const a of alerts) {
      if (!a.isResolved) {
        unresolvedCount++;
        bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
      }
      if (!a.isRead) unreadCount++;
    }

    return NextResponse.json({ alerts, bySeverity, unresolvedCount, unreadCount });
  } catch (error) {
    console.error('GET /alerts error:', error);
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

    const { searchParams } = new URL(req.url);

    // ─ Evaluate rules against current portfolio ─────────────────────────────
    if (searchParams.get('runEvaluation') === 'true') {
      const rules = await db.alertRule.findMany({
        where: { organizationId: orgId, isActive: true },
      });

      const customers = await db.customer.findMany({
        where: { organizationId: orgId },
        include: { invoices: true },
      });

      const now = new Date();
      let alertsCreated = 0;

      for (const rule of rules) {
        for (const customer of customers) {
          let shouldAlert = false;
          let alertTitle = '';
          let alertMessage = '';
          let alertType = 'SCORE_DROP';

          if (rule.triggerType === 'SCORE_DROP') {
            if (customer.riskScore < rule.threshold) {
              shouldAlert = true;
              alertType = 'SCORE_DROP';
              alertTitle = `Risk Score Drop: ${customer.name}`;
              alertMessage = `Customer "${customer.name}" has a risk score of ${customer.riskScore}, which is below your threshold of ${rule.threshold}.`;
            }
          } else if (rule.triggerType === 'OVERDUE_DAYS') {
            const overdueInvoices = customer.invoices.filter((inv) => {
              if (inv.status === 'PAID' || inv.status === 'CANCELLED') return false;
              const daysOverdue = Math.floor(
                (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
              );
              return daysOverdue > rule.threshold;
            });
            if (overdueInvoices.length > 0) {
              shouldAlert = true;
              alertType = 'OVERDUE';
              alertTitle = `Invoice Overdue Alert: ${customer.name}`;
              alertMessage = `Customer "${customer.name}" has ${overdueInvoices.length} invoice(s) overdue by more than ${rule.threshold} days. Total: ₹${overdueInvoices.reduce((s, i) => s + i.totalAmount - i.paidAmount, 0).toLocaleString('en-IN')}.`;
            }
          } else if (rule.triggerType === 'LIMIT_BREACH_PCT') {
            if (customer.creditLimit > 0) {
              const usagePct = (customer.usedCredit / customer.creditLimit) * 100;
              if (usagePct > rule.threshold) {
                shouldAlert = true;
                alertType = 'LIMIT_BREACH';
                alertTitle = `Credit Limit Breach: ${customer.name}`;
                alertMessage = `Customer "${customer.name}" has used ${usagePct.toFixed(1)}% of their credit limit (₹${customer.usedCredit.toLocaleString('en-IN')} / ₹${customer.creditLimit.toLocaleString('en-IN')}), exceeding your ${rule.threshold}% threshold.`;
              }
            }
          }

          if (shouldAlert) {
            // Check if an unresolved alert of this type already exists for this customer from this rule
            const existing = await db.alert.findFirst({
              where: {
                organizationId: orgId,
                customerId: customer.id,
                type: alertType,
                isResolved: false,
              },
            });

            if (!existing) {
              await db.alert.create({
                data: {
                  organizationId: orgId,
                  customerId: customer.id,
                  type: alertType,
                  severity: rule.severity,
                  title: alertTitle,
                  message: alertMessage,
                  isRead: false,
                  isResolved: false,
                },
              });
              alertsCreated++;
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Rule evaluation complete. ${alertsCreated} new alert(s) created.`,
        alertsCreated,
      });
    }

    // ─ Create Alert Rule ─────────────────────────────────────────────────────
    if (searchParams.get('createRule') === 'true') {
      const body = await req.json();
      const { name, triggerType, threshold, severity } = body;

      if (!name || !triggerType || threshold === undefined) {
        return NextResponse.json(
          { error: 'name, triggerType, and threshold are required' },
          { status: 400 },
        );
      }

      const validTriggers = ['SCORE_DROP', 'OVERDUE_DAYS', 'LIMIT_BREACH_PCT'];
      if (!validTriggers.includes(triggerType)) {
        return NextResponse.json({ error: `triggerType must be one of: ${validTriggers.join(', ')}` }, { status: 400 });
      }

      const rule = await db.alertRule.create({
        data: {
          organizationId: orgId,
          name: name.trim(),
          triggerType,
          threshold: parseFloat(threshold),
          severity: severity || 'HIGH',
          isActive: true,
        },
      });

      return NextResponse.json({ rule }, { status: 201 });
    }

    // ─ Create Manual Alert ───────────────────────────────────────────────────
    const body = await req.json();
    const { type, title, message, severity, customerId } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'type, title, and message are required' }, { status: 400 });
    }

    if (customerId) {
      const customer = await db.customer.findFirst({ where: { id: customerId, organizationId: orgId } });
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
    }

    const alert = await db.alert.create({
      data: {
        organizationId: orgId,
        customerId: customerId || null,
        type,
        title: title.trim(),
        message: message.trim(),
        severity: severity || 'MEDIUM',
        isRead: false,
        isResolved: false,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('POST /alerts error:', error);
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
    const { id, isRead, isResolved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const existing = await db.alert.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved;
      if (isResolved) updateData.resolvedAt = new Date();
    }

    const updated = await db.alert.update({ where: { id }, data: updateData });
    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error('PUT /alerts error:', error);
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
    const ruleId = searchParams.get('ruleId');

    if (ruleId) {
      const rule = await db.alertRule.findFirst({ where: { id: ruleId, organizationId: orgId } });
      if (!rule) return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 });
      await db.alertRule.delete({ where: { id: ruleId } });
      return NextResponse.json({ success: true, message: 'Alert rule deleted' });
    }

    if (id) {
      const alert = await db.alert.findFirst({ where: { id, organizationId: orgId } });
      if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      await db.alert.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Alert deleted' });
    }

    return NextResponse.json({ error: 'Either id or ruleId query param is required' }, { status: 400 });
  } catch (error) {
    console.error('DELETE /alerts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
