import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import OpenAI from 'openai';

type ForecastType = 'revenue' | 'cashflow' | 'dso' | 'risk';
type ForecastPeriod = '3M' | '6M' | '12M';

// Lazy initialized OpenAI Client
let openaiClient: OpenAI | null = null;
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    });
  }
  return openaiClient;
}

export const dynamic = 'force-dynamic';

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

    // Load actual organization historical data
    const [companyProfile, customers, invoices, assessments] = await Promise.all([
      db.companyProfile.findFirst({ where: { organizationId: session.organizationId } }),
      db.customer.findMany({ where: { organizationId: session.organizationId }, select: { id: true, dso: true, riskScore: true, annualRevenue: true } }),
      db.invoice.findMany({
        where: { organizationId: session.organizationId },
        select: { amount: true, status: true, dueDate: true, paidDate: true },
        take: 300,
        orderBy: { createdAt: 'desc' },
      }),
      db.creditAssessment.findMany({
        where: { organizationId: session.organizationId },
        select: { riskScore: true },
        take: 50,
      }),
    ]);

    // Compute basic aggregates to feed into OpenAI
    const annualRevenue = companyProfile?.annualRevenue || 12000000;
    const baseMonthly = annualRevenue / 12;
    const avgDSO = customers.length > 0 ? customers.reduce((sum, c) => sum + (c.dso || 42), 0) / customers.length : 42;
    const avgRiskScore = assessments.length > 0 ? assessments.reduce((sum, a) => sum + (a.riskScore || 680), 0) / assessments.length : 680;
    
    const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
    const totalInvoices = invoices.length || 1;
    const collectionRate = paidInvoices / totalInvoices;

    const contextPayload = {
      forecastType: type,
      forecastMonths: months,
      industry: companyProfile?.industry || 'General Business',
      historicalAggregates: {
        annualRevenue,
        monthlyAverageRunRate: baseMonthly,
        averageDSO: avgDSO,
        averageRiskScore: avgRiskScore,
        invoiceCollectionRate: collectionRate,
        totalCustomers: customers.length,
        totalInvoicesAnalyzed: totalInvoices
      }
    };

    // System prompt for GPT-4o Time Series Prediction
    const systemPrompt = `You are an expert AI Financial Data Scientist and Quant Analyst. 
You are tasked with generating a realistic predictive time-series forecast based on the provided historical aggregates.

Generate a JSON object exactly matching this schema:
{
  "dataPoints": [
    { "month": "Short Month Name (e.g. Jan 25)", "actual": <number or null if future month>, "projected": <number>, "confidence": <float 0.0 to 1.0> }
  ],
  "summary": "A 2-sentence executive summary of the projected trend.",
  "insights": [
    "Insight 1 (Actionable, specific to the trend and industry)",
    "Insight 2 (Risk or opportunity highlighted)",
    "Insight 3",
    "Insight 4"
  ]
}

Guidelines:
- Generate exactly ${months} data points.
- The first 2 months should represent recent history (so provide both 'actual' and 'projected'). The remaining months are purely future (so 'actual' must be null).
- Trend logic: 
  - If type='revenue' or 'cashflow', use absolute numeric values (e.g. 1500000). Apply a realistic growth trajectory with slight seasonal variance.
  - If type='dso', project the Days Sales Outstanding (e.g. 42 days).
  - If type='risk', project the default probability percentage (e.g. 3.5%).
- Ensure the projection smoothly continues from the historical baseline provided.
- Confidence should start high (e.g. 0.95) and slowly decay (e.g. down to 0.75) for months further in the future.`;

    let dataPoints: any[] = [];
    let summary = '';
    let insights: string[] = [];

    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
        throw new Error('Missing real OPENAI_API_KEY');
      }

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(contextPayload, null, 2) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3 // low temp for analytical stability
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
      dataPoints = parsedResponse.dataPoints || [];
      summary = parsedResponse.summary || 'AI Forecasting completed successfully.';
      insights = parsedResponse.insights || ['No actionable insights generated.'];
      
    } catch (err: any) {
      console.warn('AI Forecast failed, falling back to basic deterministic calculation.', err);
      // Deterministic Fallback Logic (used if API key is missing or invalid)
      const now = new Date();
      dataPoints = Array.from({ length: months }).map((_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        const isActual = i < 2;
        
        let projected = 0;
        if (type === 'revenue' || type === 'cashflow') projected = baseMonthly * (1 + (i * 0.05));
        if (type === 'dso') projected = Math.max(15, avgDSO - (i * 1.5));
        if (type === 'risk') projected = 5 + (i * 0.2); // mock 5% default risk

        return {
          month: label,
          actual: isActual ? projected * 0.95 : undefined,
          projected: Math.round(projected),
          confidence: Math.max(0.6, 0.95 - (i * 0.05))
        };
      });
      summary = `Deterministic fallback used. Please provide a valid OpenAI API key for True AI predictions.`;
      insights = [
        'AI engine is currently offline or unconfigured.',
        'Projections are based on linear regression without contextual variance.',
        'Consider enabling GPT-4o for dynamic anomaly detection.'
      ];
    }

    // Determine unit
    let unit = '';
    if (type === 'revenue' || type === 'cashflow') unit = '₹';
    if (type === 'dso') unit = 'days';
    if (type === 'risk') unit = '%';

    // Projected KPI values
    const lastProjected = dataPoints[dataPoints.length - 1]?.projected || 0;
    const midProjected = dataPoints[Math.floor(months / 2)]?.projected || 0;

    const kpis = [
      { label: `Projected at ${period}`, value: type === 'revenue' || type === 'cashflow' ? \`₹\${(lastProjected / 100000).toFixed(1)}L\` : type === 'dso' ? \`\${lastProjected} days\` : \`\${lastProjected.toFixed(1)}%\`, trend: type === 'dso' || type === 'risk' ? 'down' : 'up' },
      { label: \`Midpoint (\${Math.floor(months / 2)}M)\`, value: type === 'revenue' || type === 'cashflow' ? \`₹\${(midProjected / 100000).toFixed(1)}L\` : type === 'dso' ? \`\${midProjected} days\` : \`\${midProjected?.toFixed(1)}%\`, trend: 'up' },
      { label: 'Forecast Confidence', value: \`\${Math.round((dataPoints[dataPoints.length - 1]?.confidence || 0) * 100)}%\`, trend: 'neutral' },
    ];

    // Store forecast record asynchronously
    db.forecastRecord.create({
      data: {
        organizationId: session.organizationId,
        forecastType: type.toUpperCase(),
        period,
        dataPoints: JSON.stringify(dataPoints),
        summary,
        insights: JSON.stringify(insights),
        generatedAt: new Date(),
      },
    }).catch(() => {}); 

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
    return NextResponse.json({ error: 'Failed to generate AI forecast.' }, { status: 500 });
  }
}
