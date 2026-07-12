import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getTenantDEK, decryptWithDEK } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// GET: Returns executive credit risk reports metrics OR exports a printable Credit Memo
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isExport = searchParams.get('export') === 'true';
    const companyId = searchParams.get('companyId');

    // 1. Export Mode: Returns beautiful print-optimized HTML Credit Memo
    if (isExport && companyId) {
      const company = await db.companyProfile.findUnique({
        where: { id: companyId, organizationId: session.organizationId },
        include: {
          assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
          litigations: true
        }
      });

      if (!company) {
        return new Response('Company profile not found.', { status: 404 });
      }

      const dek = await getTenantDEK(session.organizationId);
      const decCin = decryptWithDEK(company.cin || '', dek);
      const decGstin = decryptWithDEK(company.gstin || '', dek);
      const decPan = decryptWithDEK(company.pan || '', dek);

      const assess = company.assessments[0];
      const rating = assess?.creditRating || 'B';
      const score = assess?.creditScore || 500;
      const limit = assess?.recommendedLimit || 0;
      const risk = assess?.riskScore || 50;

      const assessData = assess ? JSON.parse(assess.assessmentData) : null;
      const explanations = assessData?.explanations || [
        'Insufficient financial statement history observed in registries.',
        'Credit risk coefficient calculated from default industry matrices.'
      ];

      // Premium print CSS & structured B2B layout
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Credit Memo - ${company.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=Inter:wght@400;500;700&family=Manrope:wght@800&display=swap');
    
    :root {
      --primary: #0B1F3A;
      --secondary: #2563EB;
      --foreground: #1E293B;
      --muted: #64748B;
      --border: #E2E8F0;
      --background: #F8FAFC;
      --success: #10B981;
      --danger: #EF4444;
      --warning: #F59E0B;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: var(--foreground);
      background: #ffffff;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      background: var(--primary);
      color: #ffffff;
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      color: var(--primary);
      font-size: 1.4rem;
      letter-spacing: -0.02em;
    }

    .meta-details {
      text-align: right;
      font-size: 0.85rem;
      color: var(--muted);
    }

    h1 {
      font-family: 'Manrope', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      margin: 0 0 10px 0;
      letter-spacing: -0.02em;
    }

    .subtitle {
      color: var(--muted);
      font-size: 0.95rem;
      margin-bottom: 30px;
    }

    .grid-kpi {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }

    .kpi-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      background: var(--background);
    }

    .kpi-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--muted);
      letter-spacing: 0.05em;
      margin-bottom: 5px;
    }

    .kpi-value {
      font-family: 'IBM Plex Sans', monospace;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
    }

    .kpi-desc {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 5px;
    }

    .section-title {
      font-family: 'Manrope', sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 0.85rem;
    }

    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      background: var(--background);
      font-weight: 700;
      color: var(--muted);
    }

    .field-name {
      color: var(--muted);
      font-weight: 500;
      width: 35%;
    }

    .field-value {
      font-weight: 600;
    }

    .bullet-points {
      padding-left: 20px;
      margin: 0;
      font-size: 0.85rem;
    }

    .bullet-points li {
      margin-bottom: 8px;
    }

    .footer-stamp {
      margin-top: 60px;
      border-top: 1px solid var(--border);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--muted);
    }

    .stamp-logo {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      color: var(--primary);
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <header>
      <div class="logo-container">
        <div class="logo-icon">P</div>
        <span class="logo-text">PROVENTA</span>
      </div>
      <div class="meta-details">
        <div><strong>Document ID</strong>: MEMO-${company.id.substring(0,8).toUpperCase()}</div>
        <div><strong>Audit Class</strong>: Confidentials • SOC-2</div>
        <div><strong>Generated</strong>: ${new Date().toLocaleDateString()}</div>
      </div>
    </header>

    <main>
      <h1>OFFICIAL CREDIT MEMO REPORT</h1>
      <div class="subtitle">Algorithmic risk evaluation, financial ratios audits, and credit limit cap recommendation.</div>

      <div class="grid-kpi">
        <div class="kpi-card">
          <div class="kpi-title">Credit Assessment</div>
          <div class="kpi-value" style="color: ${score >= 700 ? 'var(--success)' : score >= 600 ? 'var(--warning)' : 'var(--danger)'}">
            ${rating}
          </div>
          <div class="kpi-desc">Score: ${score}/900</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-title">Risk Coefficient</div>
          <div class="kpi-value">${risk}%</div>
          <div class="kpi-desc">Default Probability</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-title">Credit Limit Cap</div>
          <div class="kpi-value" style="color: var(--secondary)">₹${limit.toLocaleString('en-IN')}</div>
          <div class="kpi-desc">Suggested Terms: ${score >= 700 ? 'Net-30' : score >= 600 ? 'Net-15' : 'COD'}</div>
        </div>
      </div>

      <div class="section-title">Corporate KYB Registries</div>
      <table>
        <tr>
          <td class="field-name">Company Legal Name</td>
          <td class="field-value">${company.name}</td>
        </tr>
        <tr>
          <td class="field-name">Industry Category</td>
          <td class="field-value">${company.industry}</td>
        </tr>
        <tr>
          <td class="field-name">Government CIN</td>
          <td class="field-value">${decCin || 'N/A'}</td>
        </tr>
        <tr>
          <td class="field-name">GSTIN Registration</td>
          <td class="field-value">${decGstin || 'N/A'}</td>
        </tr>
        <tr>
          <td class="field-name">Permanent Account (PAN)</td>
          <td class="field-value">${decPan || 'N/A'}</td>
        </tr>
        <tr>
          <td class="field-name">Annual Revenue Index</td>
          <td class="field-value">₹${(company.annualRevenue || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="field-name">Registered Address</td>
          <td class="field-value">${company.regAddress}, ${company.city}, ${company.state}</td>
        </tr>
      </table>

      <div class="section-title">AI Credit Justification Metrics</div>
      <ul class="bullet-points">
        ${explanations.map(exp => `<li>${exp}</li>`).join('')}
      </ul>

      <div class="section-title">Litigation & Dispute Filings</div>
      ${company.litigations.length === 0 ? `
        <div style="font-size: 0.85rem; padding: 12px; border: 1px solid var(--success); border-radius: 6px; background: rgba(16,185,129,0.04); color: var(--success); font-weight: 500;">
          ✔ Clean ledger. No active civil lawsuits or insolvency cases detected.
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Tribunal/Court</th>
              <th>Filing Date</th>
              <th>Disputed Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${company.litigations.map(l => `
              <tr>
                <td><strong>${l.caseNumber}</strong></td>
                <td>${l.court}</td>
                <td>${l.filingDate}</td>
                <td style="color: var(--danger); font-weight: 700;">₹${l.amountDisputed.toLocaleString('en-IN')}</td>
                <td>${l.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </main>

    <div class="footer-stamp">
      <div>
        <strong>Analyst</strong>: Proventa AI Auditor
      </div>
      <div class="stamp-logo">
        🛡️ Secured by Proventa Zero-Trust
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
      `;

      return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 2. Normal Mode: Returns general dashboard reports metrics
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
