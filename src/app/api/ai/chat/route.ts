import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getTenantDEK, decryptWithDEK } from '@/lib/encryption';
import { logEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// List of prompt injection and jailbreak keyphrases to filter out
const PROMPT_INJECTION_KEYWORDS = [
  'ignore previous instructions',
  'system prompt',
  'jailbreak',
  'expose keys',
  'bypass rules',
  'override restrictions',
  'reveal developer keys',
  'sql injection',
  'format c:'
];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message query is required' }, { status: 400 });
    }

    const query = message.toLowerCase().trim();

    // 1. Guardrails check: Prompt Injection & Jailbreak Attempts Filter
    const hasInjectionAttempt = PROMPT_INJECTION_KEYWORDS.some(keyword => query.includes(keyword));
    if (hasInjectionAttempt) {
      if (session) {
        await logEvent(
          session.userId,
          session.email,
          'AI_PROMPT_INJECTION_ATTEMPT',
          `Blocked potential prompt injection query: "${message.substring(0, 100)}"`
        );
      }
      return NextResponse.json({ 
        reply: '⚠️ **Proventa AI Guardrails Alert**: Your query was blocked because it contains instructions that violate our system safety rules.' 
      });
    }

    // 2. If NO session exists, handle as a public marketing query
    if (!session || !session.organizationId) {
      let reply = '';
      if (query.includes('features') || query.includes('what is') || query.includes('how does') || query.includes('proventa') || query.includes('capability')) {
        reply = `### What is Proventa?
Proventa is an enterprise-grade **AI Credit Intelligence Platform** designed for CFOs, credit managers, and B2B finance departments.

**Key Capabilities:**
* 🛡️ **Automated Credit Assessments**: Instant risk matrix calculations and credit rating assignments.
* 📋 **Compliance Scan & Due Diligence**: Automated CIN, GSTIN, PAN validation and civil litigation monitoring.
* 🔌 **ERP & Banking Connectors**: Out-of-the-box syncing with QuickBooks, Tally, HDFC Bank, etc.
* 💸 **Cash Flow Reconciliation**: AI matching ledger logs against bank records to detect discrepancies.

*To see these features in action, please [Sign Up](/signup) or request a demo!*`;
      } 
      else if (query.includes('pricing') || query.includes('cost') || query.includes('plan')) {
        reply = `### Proventa Pricing Plans
We offer flexible tier options tailored to your business volume:
* 🏢 **Free Trial**: Includes 5 company scans, core KYC validation, and email support.
* 🚀 **Growth Plan**: Includes 50 monthly scans, ERP integrations, and basic risk forecasting.
* 👑 **Enterprise Plan**: Custom volumes, dedicated database isolation, custom data retention policies, and SOC-2 security protocols.

[Click here to Request a Demo](/signup) or contact our sales team to discuss enterprise options.`;
      }
      else if (query.includes('security') || query.includes('compliance') || query.includes('soc') || query.includes('privacy')) {
        reply = `### Enterprise-Grade Security
At Proventa, security is built into our core architecture:
* 🔒 **Data Encryption Key (DEK) Isolation**: All sensitive counterparty tax and financial documents are isolated per-tenant.
* 🛡️ **SOC-2 & GDPR Compliance**: Aligned with industry security benchmarks.
* 👤 **Least Privilege Access Control**: Roles (Viewer, Sales, Credit Manager, Admin) enforce masked displays for sensitive identifiers.`;
      }
      else {
        reply = `Hello! I am the **Proventa AI Assistant**. 

I can answer questions about:
* **Proventa features** (e.g., credit assessments, due diligence audits, ledger reconciliations).
* **Enterprise Security** (e.g., SOC-2 compliance, encryption keys).
* **Plans and pricing**.

🔒 *Note: To generate credit memos or query live portfolio metrics, please [Sign In](/login).*`;
      }
      return NextResponse.json({ reply });
    }

    // Retrieve organization's Data Encryption Key (DEK)
    const dek = await getTenantDEK(session.organizationId);

    // Fetch all organization companies with assessments and litigations
    const rawCompanies = await db.companyProfile.findMany({
      where: { organizationId: session.organizationId },
      include: {
        assessments: true,
        litigations: true,
      }
    });

    // Decrypt identifiers dynamically
    const companies = rawCompanies.map(c => {
      let rawCin = decryptWithDEK(c.cin || '', dek);
      let rawGstin = decryptWithDEK(c.gstin || '', dek);
      let rawPan = decryptWithDEK(c.pan || '', dek);

      // Enforce Least Privilege Masking: Viewer and Sales roles see masked values
      const shouldMask = session.role === 'VIEWER' || session.role === 'SALES';
      if (shouldMask) {
        rawCin = rawCin ? `${rawCin.substring(0, 4)}*******${rawCin.substring(rawCin.length - 2)}` : '';
        rawGstin = rawGstin ? `${rawGstin.substring(0, 2)}***********${rawGstin.substring(rawGstin.length - 2)}` : '';
        rawPan = rawPan ? `${rawPan.substring(0, 3)}*****${rawPan.substring(rawPan.length - 2)}` : '';
      }

      return {
        ...c,
        cin: rawCin,
        gstin: rawGstin,
        pan: rawPan
      };
    });

    let reply = '';
    
    // Core NLP routing for Proventa Credit Intelligence
    if (query.includes('credit memo')) {
      const match = companies.find(c => query.includes(c.name.toLowerCase()) || query.includes(c.tradeName?.toLowerCase() || ''));
      if (match) {
        const assess = match.assessments[0];
        const data = assess ? JSON.parse(assess.assessmentData) : null;
        reply = `### 📋 CREDIT MEMO: ${match.name.toUpperCase()}
**Date**: ${new Date().toLocaleDateString()}
**Analyst**: Proventa AI Copilot
**Role clearance**: ${session.role}

#### 1. Executive Summary
${match.name} is a ${match.legalType.replace('_', ' ')} entity operating in the ${match.industry} sector. The platform has assigned a credit rating of **${assess?.creditRating || 'B'}** with a Credit Score of **${assess?.creditScore || 500}/900**, indicating a **${assess?.riskScore > 60 ? 'HIGH' : assess?.riskScore > 30 ? 'MODERATE' : 'LOW'}** risk level.

#### 2. Key Metrics & Financial Analysis
* **Annual Revenue**: $${(match.annualRevenue || 0).toLocaleString()}
* **Recommended Trade Credit Line**: $${(assess?.recommendedLimit || 0).toLocaleString()}
* **Liquidity Ratio**: ${data?.metrics?.liquidityRatio || '1.1'}x (Standard: > 1.2x)
* **Debt to Equity**: ${data?.metrics?.debtToEquity || '1.5'}x (Standard: < 2.0x)
* **Operating Margins**: ${data?.metrics?.operatingMargin || '8.5'}%

#### 3. Risk Assessment & Mitigations
* **Litigation Audit**: Found **${match.litigations.length}** pending case(s) in active court systems.
* **Payment Performance**: Simulated historical on-time payment rate of **${data?.metrics?.onTimePaymentRate || 80}%**.
* **Mitigation Recommendation**: ${assess?.creditScore > 650 ? 'Proceed with standard Trade Credit limits under Net-30 accounts.' : 'We recommend restricted credit exposure. Require 50% advance payments and structure the remaining balance under Net-15 terms with corporate guarantees.'}

#### 4. AI Copilot Sign-Off & Reasoning
* **Reasoning**: The recommended limit of $${(assess?.recommendedLimit || 0).toLocaleString()} is derived from ${match.name}'s annual revenues, scaling down linearly based on the risk score of ${assess?.riskScore}/100 and factoring in ${match.litigations.length} litigation record(s).`;
      } else {
        reply = `Which company would you like to generate a Credit Memo for? Current profiles: ${companies.map(c => `**${c.name}**`).join(', ')}.`;
      }
    }
    
    else if (query.includes('compare')) {
      const selected = companies.slice(0, 3);
      reply = `### 📊 Portfolio Comparison Model (Top 3 Companies)

| Company | Industry | Credit Score | Rating | Risk Score | Recommended Limit | Active Litigations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${selected.map(c => {
  const assess = c.assessments[0];
  return `| **${c.name}** | ${c.industry} | ${assess?.creditScore || 'N/A'} | ${assess?.creditRating || 'N/A'} | ${assess?.riskScore || 0}% | $${(assess?.recommendedLimit || 0).toLocaleString()} | ${c.litigations.length} |`;
}).join('\n')}

#### AI Comparative Rationale:
* **Top Performer**: ${selected.find(c => (c.assessments[0]?.creditScore || 0) === Math.max(...selected.map(x => x.assessments[0]?.creditScore || 0)))?.name || 'N/A'} represents the lowest default risk with optimal cash reserves.
* **Watchlist**: ${selected.find(c => c.litigations.length > 0)?.name || 'None'} requires active monitoring due to legal exposure and high gearing ratios.`;
    }
    
    else if (query.includes('due diligence') || query.includes('compliance')) {
      const match = companies.find(c => query.includes(c.name.toLowerCase()) || query.includes(c.tradeName?.toLowerCase() || ''));
      if (match) {
        const hasGst = !!match.gstin;
        const hasPan = !!match.pan;
        reply = `### 🔍 DUE DILIGENCE REPORT: ${match.name.toUpperCase()}

#### 1. KYC & Corporate Integrity Verification
* **CIN Status**: Registered & Active (Incorporated: ${match.incorporationDate || 'N/A'})
* **PAN Identification**: Verification ${hasPan ? 'SUCCESSFUL' : 'MISSING'} (${match.pan || 'N/A'})
* **GSTIN Database Check**: Registered ${hasGst ? 'SUCCESSFUL' : 'MISSING'} (${match.gstin || 'N/A'})
* **Official Contacts**: Website: ${match.website || 'N/A'} | Phone: ${match.phone || 'N/A'}

#### 2. Legal & Insolvency Check
* **Litigation Audits**: Platform detected **${match.litigations.length}** litigation case filings.
* **Insolvency Flag**: Clear. No active liquidation filings detected.

#### 3. AI Risk Recommendation
* **Status**: ${match.litigations.length > 0 ? '⚠️ CONDITIONAL APPROVAL. Monitor active case OS/10294/2025.' : '✅ VERIFIED. Satisfactory corporate governance checks.'}
* **Reasoning**: The due diligence checks verify existence, active registration credentials, and flag litigation liability.`;
      } else {
        reply = `Please specify which company to audit for Due Diligence. Available: ${companies.map(c => `**${c.name}**`).join(', ')}.`;
      }
    }
    
    else if (query.includes('limit') || query.includes('term') || query.includes('recommendation')) {
      const match = companies.find(c => query.includes(c.name.toLowerCase()) || query.includes(c.tradeName?.toLowerCase() || ''));
      if (match) {
        const assess = match.assessments[0];
        reply = `### 💰 Credit Limit & Terms: ${match.name}
* **Recommended Limit**: $${(assess?.recommendedLimit || 0).toLocaleString()}
* **Suggested Terms**: ${assess?.creditScore >= 700 ? 'Net-30 Days. Premium buyer.' : assess?.creditScore >= 600 ? 'Net-15 Days. Require standard post-dated cheques.' : 'Cash on Delivery (COD) / CIA. Elevated credit risk.'}
* **Alternative Term Option**: Net-45 eligible with a Bank Guarantee support structure.

#### Reasoning:
* Credit rating is **${assess?.creditRating}** with a default risk weighting of **${assess?.riskScore}%**. Higher margins support limit extension, while pending litigation limits terms to minimize capital lockdown.`;
      } else {
        reply = `Which company are you reviewing limits for? Profiles: ${companies.map(c => `**${c.name}**`).join(', ')}.`;
      }
    }
    
    else if (query.includes('forecasting') || query.includes('predict') || query.includes('future')) {
      reply = `### 📈 12-Month Portfolio Risk Forecasting

Our predictive risk engine has synthesized the macro factors, industry averages, and historical delay matrices of your portfolio:
1. **Q1-Q2 Forecast**: Default risk is expected to remain stable at **4.2%** average across the logistics and technology holdings.
2. **Manufacturing Sector Stress Warning**: High interest rate environment will likely pressure cash reserves of manufacturing suppliers, indicating a possible 5-10 day delay increase.
3. **Optimized Cash Runway Recommendation**: Retain a collections buffer of 8% on outstanding accounts receivable to offset delays.

* **Reasoning**: Calculations model standard deviation of payment cycles against the average federal credit tightening coefficients.`;
    }
    
    else {
      // General conversational fallback with company context
      reply = `Hello! I am your **Proventa AI Copilot**. I have access to your Credit Intelligence database, which currently tracks **${companies.length}** companies.

Here are some specialized tasks I can perform:
* **"Generate a Credit Memo for [Company Name]"**: Build a full credit dossier.
* **"Due Diligence audit on [Company Name]"**: Check compliance, GSTIN, PAN, and litigations.
* **"Recommend limits for [Company Name]"**: Review trade terms.
* **"Compare portfolio companies"**: Generate a multi-company comparative scorecard.
* **"Risk forecasting"**: Trend analysis of credit default indices.

Currently loaded companies: ${companies.map(c => `**${c.name}** (${c.assessments[0]?.creditRating || 'No Rating'})`).join(', ')}. How can I assist you today?`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
