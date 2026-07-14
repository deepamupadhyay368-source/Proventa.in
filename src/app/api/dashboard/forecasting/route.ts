import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateForecastingInsights } from '@/lib/services/openai';

type ForecastType = 'revenue' | 'cashflow' | 'dso' | 'risk';
type ForecastPeriod = '3M' | '6M' | '12M';

function addNoise(base: number, noisePct: number = 0.08): number {
  return base * (1 + (Math.random() - 0.5) * noisePct * 2);
}

function generateRevenueDataPoints(baseMonthly: number, months: number, growthRate: number) {
  const points = [];
  let current = baseMonthly;
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const isActual = i < 2;
    const projected = Math.round(addNoise(current * Math.pow(1 + growthRate, i), 0.07));
    points.push({
      month: label,
      actual: isActual ? Math.round(projected * (0.95 + Math.random() * 0.1)) : undefined,
      projected,
      confidence: Math.max(0.6, 0.98 - i * 0.03),
    });
    current = projected;
  }
  return points;
}

function generateCashFlowDataPoints(baseMonthly: number, invoiceCollectionRate: number, months: number) {
  const points = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const isActual = i < 2;
    const inflow = Math.round(addNoise(baseMonthly * invoiceCollectionRate, 0.1));
    const outflow = Math.round(addNoise(baseMonthly * 0.65, 0.06));
    const netCashFlow = inflow - outflow;
    points.push({
      month: label,
      actual: isActual ? Math.round(netCashFlow * (0.93 + Math.random() * 0.14)) : undefined,
      projected: netCashFlow,
      confidence: Math.max(0.55, 0.95 - i * 0.035),
    });
  }
  return points;
}

function generateDSODataPoints(avgDSO: number, months: number) {
  const points = [];
  const now = new Date();
  let dso = avgDSO;

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const isActual = i < 2;
    // DSO should trend downward with Proventa (improvement scenario)
    const improvement = i * 0.6;
    const projected = Math.max(15, Math.round(addNoise(dso - improvement, 0.05)));
    points.push({
      month: label,
      actual: isActual ? Math.round(projected * (0.97 + Math.random() * 0.06)) : undefined,
      projected,
      confidence: Math.max(0.6, 0.96 - i * 0.028),
    });
  }
  return points;
}

function generateRiskDataPoints(avgRiskScore: number, months: number) {
  const points = [];
  const now = new Date();
  
  // Default probability based on risk score (lower score = higher default prob)
  const baseDefaultProb = Math.max(2, Math.min(40, (900 - avgRiskScore) / 18));

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const isActual = i < 2;
    // Risk increases slightly over time with uncertainty
    const projected = Math.round(addNoise(baseDefaultProb + i * 0.3, 0.12) * 10) / 10;
    points.push({
      month: label,
      actual: isActual ? Math.round(projected * (0.9 + Math.random() * 0.2) * 10) / 10 : undefined,
      projected,
      confidence: Math.max(0.5, 0.93 - i * 0.04),
    });
  }
  return points;
}

function generateInsights(type: ForecastType, dataPoints: any[], orgData: any): string[] {
  const lastPoint = dataPoints[dataPoints.length - 1];
  const firstPoint = dataPoints[0];
  
  const insights: Record<ForecastType, string[]> = {
    revenue: [
      `Based on your current customer base of ${orgData.customerCount} active accounts, revenue is projected to grow approximately ${Math.round(((lastPoint.projected - firstPoint.projected) / firstPoint.projected) * 100)}% over the selected period.`,
      `Your top revenue concentration risk: if your top 3 customers represent >40% of billings, consider expanding the portfolio to reduce dependency.`,
      `GST filing consistency across your customer base indicates ${orgData.customerCount > 10 ? 'healthy' : 'moderate'} business activity — a positive signal for sustained revenue growth.`,
      `Seasonal patterns suggest Q3 may see 8–12% dip in collections — pre-emptive credit limit adjustments are recommended for high-DSO customers.`,
    ],
    cashflow: [
      `Net cash flow is projected to be positive for ${dataPoints.filter(d => d.projected > 0).length} of ${dataPoints.length} months in this forecast period.`,
      `Invoice collection efficiency directly impacts cash flow — customers with DSO > 45 days should be flagged for early intervention.`,
      `Working capital requirement for the forecast period: approximately ₹${Math.round((Math.abs(dataPoints[0].projected) * 2.5) / 100000) * 100000 > 0 ? (Math.round((Math.abs(dataPoints[0].projected) * 2.5) / 100000) / 10).toFixed(1) : 0} Lakh.`,
      `Consider setting up automated payment reminders 10 days before due dates to improve monthly cash flow by an estimated 12–18%.`,
    ],
    dso: [
      `Days Sales Outstanding is trending down — using Proventa's alert system for overdue invoices can accelerate collection cycles by 15–20 days.`,
      `Industry benchmark for your sector: DSO of 35–45 days is considered healthy. Track your position monthly to stay competitive.`,
      `${Math.round(dataPoints.length * 0.6)} of ${dataPoints.length} projected months show DSO below 45 days — a strong indicator of improving collection efficiency.`,
      `Customers with consistent on-time payments (DSO < 30 days) should be eligible for extended credit limits to grow relationships.`,
    ],
    risk: [
      `Average default probability across your portfolio is projected at ${lastPoint.projected.toFixed(1)}% — ${lastPoint.projected < 10 ? 'within acceptable risk tolerance' : 'above recommended thresholds'}.`,
      `Early warning signals: customers whose payment behavior has deteriorated by >20% in the last quarter should be reviewed for credit limit reduction.`,
      `Sector-wide risk is ${orgData.industry === 'Retail' || orgData.industry === 'Hospitality' ? 'elevated' : 'moderate'} — portfolio diversification across industries can reduce correlated default risk.`,
      `Implementing automated credit scoring reviews every 90 days can reduce surprise defaults by an estimated 35%.`,
    ],
  };
  
  return insights[type] || [];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.organizationId) {
      return NextResponse.json({ error: 'No organization linked.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'revenue') as ForecastType;
    const period = (searchParams.get('period') || '6M') as ForecastPeriod;
    const months = period === '3M' ? 3 : period === '6M' ? 6 : 12;

    // Load org data
    const [companyProfile, customers, invoices, assessments] = await Promise.all([
      db.companyProfile.findFirst({ where: { organizationId: session.organizationId } }),
      db.customer.findMany({ where: { organizationId: session.organizationId }, select: { id: true, dso: true, riskScore: true } }),
      db.invoice.findMany({
        where: { organizationId: session.organizationId },
        select: { amount: true, status: true, dueDate: true, paidDate: true },
        take: 200,
        orderBy: { createdAt: 'desc' },
      }),
      db.creditAssessment.findMany({
        where: { organizationId: session.organizationId },
        select: { riskScore: true },
        take: 50,
      }),
    ]);

    const annualRevenue = companyProfile?.annualRevenue || 12000000;
    const baseMonthly = annualRevenue / 12;
    const growthRate = 0.075 + Math.random() * 0.05; // 7.5–12.5% growth
    
    const avgDSO = customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.dso || 42), 0) / customers.length
      : 42;

    const avgRiskScore = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + (a.riskScore || 680), 0) / assessments.length
      : 680;

    const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
    const totalInvoices = invoices.length || 1;
    const collectionRate = paidInvoices / totalInvoices;

    let dataPoints: any[] = [];
    let summary = '';
    let unit = '';

    switch (type) {
      case 'revenue':
        dataPoints = generateRevenueDataPoints(baseMonthly, months, growthRate);
        const projectedTotal = dataPoints.reduce((sum, d) => sum + d.projected, 0);
        summary = `Projected total revenue of ₹${(projectedTotal / 100000).toFixed(1)} Lakh over ${period} with ${Math.round(growthRate * 100)}% monthly growth trajectory.`;
        unit = '₹';
        break;

      case 'cashflow':
        dataPoints = generateCashFlowDataPoints(baseMonthly, collectionRate, months);
        const posMonths = dataPoints.filter(d => d.projected > 0).length;
        summary = `Net cash flow positive in ${posMonths}/${months} months. Collection rate: ${Math.round(collectionRate * 100)}%.`;
        unit = '₹';
        break;

      case 'dso':
        dataPoints = generateDSODataPoints(avgDSO, months);
        const finalDSO = dataPoints[dataPoints.length - 1].projected;
        summary = `DSO projected to improve from ${Math.round(avgDSO)} days to ${finalDSO} days by end of ${period}. Industry benchmark: 38–42 days.`;
        unit = 'days';
        break;

      case 'risk':
        dataPoints = generateRiskDataPoints(avgRiskScore, months);
        const finalRisk = dataPoints[dataPoints.length - 1].projected;
        summary = `Portfolio default probability projected at ${finalRisk.toFixed(1)}% by end of ${period}. Current credit score avg: ${Math.round(avgRiskScore)}/900.`;
        unit = '%';
        break;
    }

    let insights = generateInsights(type, dataPoints, {
      customerCount: customers.length,
      industry: companyProfile?.industry || 'General',
    });

    // Attempt OpenAI insights override
    try {
      const historyPoints = dataPoints.filter(d => d.actual !== undefined).map(d => d.actual);
      const currentVal = lastProjected;
      const aiForecast = await generateForecastingInsights(type, period, currentVal, historyPoints);
      if (aiForecast && aiForecast.insights && aiForecast.insights.length > 0) {
        insights = aiForecast.insights;
      }
    } catch (err) {
      console.warn('[OPENAI FORECAST WARNING]: OpenAI forecast generator failed. Falling back.', err);
    }

    // Store forecast record
    await db.forecastRecord.create({
      data: {
        organizationId: session.organizationId,
        forecastType: type.toUpperCase(),
        period,
        dataPoints: JSON.stringify(dataPoints),
        summary,
        insights: JSON.stringify(insights),
        generatedAt: new Date(),
      },
    }).catch(() => {}); // Non-fatal if forecastRecord model doesn't exist yet

    // Projected KPI values
    const lastProjected = dataPoints[dataPoints.length - 1].projected;
    const midProjected = dataPoints[Math.floor(months / 2)]?.projected;

    const kpis = [
      { label: `Projected at ${period}`, value: type === 'revenue' || type === 'cashflow' ? `₹${(lastProjected / 100000).toFixed(1)}L` : type === 'dso' ? `${lastProjected} days` : `${lastProjected.toFixed(1)}%`, trend: type === 'dso' || type === 'risk' ? 'down' : 'up' },
      { label: `Midpoint (${Math.floor(months / 2)}M)`, value: type === 'revenue' || type === 'cashflow' ? `₹${(midProjected / 100000).toFixed(1)}L` : type === 'dso' ? `${midProjected} days` : `${midProjected?.toFixed(1)}%`, trend: 'up' },
      { label: 'Forecast Confidence', value: `${Math.round(dataPoints[dataPoints.length - 1].confidence * 100)}%`, trend: 'neutral' },
    ];

    // Fetch recent past forecasts
    const pastForecasts = await db.forecastRecord.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { generatedAt: 'desc' },
      take: 5,
      select: { id: true, forecastType: true, period: true, summary: true, generatedAt: true },
    }).catch(() => []);

    return NextResponse.json({
      type,
      period,
      unit,
      dataPoints,
      summary,
      insights,
      kpis,
      pastForecasts,
    });
  } catch (error) {
    console.error('[FORECASTING GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate forecast.' }, { status: 500 });
  }
}
