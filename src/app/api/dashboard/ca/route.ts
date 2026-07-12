import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────
//  AI CA COPILOT — backend computation engine
//  Covers: GST, TDS, P&L, ITR, Payroll, Audit, Ratios, MCA
// ─────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module') || 'summary';
  const orgId = session.organizationId;

  if (!orgId) return NextResponse.json({ error: 'No organization found' }, { status: 400 });

  try {
    const org = await db.organization.findUnique({ where: { id: orgId } });
    const companies = await db.companyProfile.findMany({
      where: { organizationId: orgId },
      include: { assessments: true, documents: true }
    });

    const primary = companies[0];

    // ── MODULE: Dashboard Overview
    if (module === 'summary') {
      const assessments = companies.flatMap(c => c.assessments);
      const totalRevenue = companies.reduce((s, c) => s + (c.annualRevenue || 0), 0);
      const avgRisk = assessments.length
        ? assessments.reduce((s, a: any) => s + (a.riskScore || 50), 0) / assessments.length
        : 50;

      return NextResponse.json({
        summary: {
          companyName: primary?.name || org?.name || 'Your Organization',
          gstin: primary?.gstin || null,
          pan: primary?.pan || null,
          planType: org?.planType,
          totalRevenue,
          companiesTracked: companies.length,
          avgRiskScore: Math.round(avgRisk),
          documentsVaulted: companies.reduce((s, c) => s + c.documents.length, 0),
        }
      });
    }

    // ── MODULE: GST Compliance Engine
    if (module === 'gst') {
      const currentMonth = new Date().getMonth() + 1;
      const quarter = Math.ceil(currentMonth / 3);
      const fy = new Date().getFullYear();
      const fyLabel = `FY ${fy}-${(fy + 1).toString().slice(2)}`;

      // Simulated GST workings from company revenue
      const estimatedTurnover = primary?.annualRevenue || 10000000;
      const estimatedGSTOutput = Math.round(estimatedTurnover * 0.18);
      const estimatedGSTInput = Math.round(estimatedGSTOutput * 0.65);
      const netGSTPayable = estimatedGSTOutput - estimatedGSTInput;

      const filings = [
        { form: 'GSTR-1', period: `${currentMonth - 1 > 0 ? currentMonth - 1 : 12}/${fy}`, dueDate: '11th next month', status: currentMonth > 5 ? 'FILED' : 'PENDING', liability: 0 },
        { form: 'GSTR-3B', period: `${currentMonth - 1 > 0 ? currentMonth - 1 : 12}/${fy}`, dueDate: '20th next month', status: 'PENDING', liability: netGSTPayable },
        { form: 'GSTR-9', period: fyLabel, dueDate: '31 Dec', status: 'UPCOMING', liability: 0 },
        { form: 'GSTR-9C', period: fyLabel, dueDate: '31 Dec', status: 'UPCOMING', liability: 0 },
      ];

      return NextResponse.json({
        gstin: primary?.gstin || 'Not Linked',
        turnover: estimatedTurnover,
        outputTax: estimatedGSTOutput,
        inputTaxCredit: estimatedGSTInput,
        netPayable: netGSTPayable,
        quarter: `Q${quarter}`,
        fy: fyLabel,
        filings,
        complianceScore: primary?.gstin ? 88 : 42,
        recommendations: [
          'File GSTR-1 by 11th to avoid ₹50/day late fee.',
          'Reconcile ITC with GSTR-2B before GSTR-3B filing.',
          primary?.gstin ? 'GSTIN Active – Annual turnover filing GSTR-9 due Dec 31.' : '⚠️ GSTIN not linked. Link PAN/GSTIN for automated filing.',
        ]
      });
    }

    // ── MODULE: TDS/TCS Management
    if (module === 'tds') {
      const revenue = primary?.annualRevenue || 10000000;
      const payroll = revenue * 0.25; // est payroll
      const tdsPayroll = Math.round(payroll * 0.10);
      const tdsContractors = Math.round(revenue * 0.01);
      const tdsRent = Math.round(250000 * 0.10);
      const totalTDS = tdsPayroll + tdsContractors + tdsRent;

      const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const challanPaid = Math.round(totalTDS * 0.72);
      const outstanding = totalTDS - challanPaid;

      return NextResponse.json({
        fy: `FY ${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`,
        quarter: `Q${quarter}`,
        deductions: [
          { section: '192 – Salary (TDS)', estimated: tdsPayroll, deposited: Math.round(tdsPayroll * 0.72), status: 'PARTIAL' },
          { section: '194C – Contractors', estimated: tdsContractors, deposited: tdsContractors, status: 'PAID' },
          { section: '194I – Rent', estimated: tdsRent, deposited: tdsRent, status: 'PAID' },
          { section: '194J – Professionals', estimated: 25000, deposited: 0, status: 'PENDING' },
        ],
        totalDeducted: totalTDS,
        challanDeposited: challanPaid,
        outstandingLiability: outstanding,
        interestRisk: Math.round(outstanding * 0.015),
        forms: [
          { form: 'Form 24Q (Salary)', quarter: `Q${quarter}`, dueDate: '31st month after quarter', status: 'PENDING' },
          { form: 'Form 26Q (Non-Salary)', quarter: `Q${quarter}`, dueDate: '31st month after quarter', status: 'PENDING' },
          { form: 'Form 16 (Employee)', period: 'Annual', dueDate: '15 June', status: 'UPCOMING' },
          { form: 'Form 16A (Non-Salary)', period: `Q${quarter}`, dueDate: '15th month after quarter', status: 'UPCOMING' },
        ]
      });
    }

    // ── MODULE: P&L Financial Statement
    if (module === 'pnl') {
      const revenue = primary?.annualRevenue || 10000000;
      const cogs = Math.round(revenue * 0.52);
      const grossProfit = revenue - cogs;
      const opex = Math.round(revenue * 0.22);
      const ebitda = grossProfit - opex;
      const depreciation = Math.round(revenue * 0.04);
      const ebit = ebitda - depreciation;
      const interest = Math.round(revenue * 0.025);
      const pbt = ebit - interest;
      const tax = Math.round(pbt * 0.25);
      const pat = pbt - tax;

      return NextResponse.json({
        period: `FY ${new Date().getFullYear()}`,
        company: primary?.name || org?.name,
        income: {
          operatingRevenue: revenue,
          otherIncome: Math.round(revenue * 0.02),
          totalIncome: Math.round(revenue * 1.02)
        },
        expenses: {
          cogs,
          employeeBenefits: Math.round(revenue * 0.14),
          rentUtilities: Math.round(revenue * 0.04),
          adminOverheads: Math.round(revenue * 0.04),
          depreciation,
          financeCosts: interest,
          totalExpenses: cogs + opex + depreciation + interest
        },
        metrics: {
          grossProfit,
          grossMargin: +((grossProfit / revenue) * 100).toFixed(1),
          ebitda,
          ebitdaMargin: +((ebitda / revenue) * 100).toFixed(1),
          pbt,
          tax,
          pat,
          patMargin: +((pat / revenue) * 100).toFixed(1),
        },
        ratios: {
          currentRatio: 1.8,
          quickRatio: 1.2,
          debtToEquity: 0.6,
          interestCoverage: +(ebit / interest).toFixed(1),
          returnOnEquity: +((pat / (revenue * 0.4)) * 100).toFixed(1),
          returnOnAssets: +((pat / revenue) * 100).toFixed(1),
        }
      });
    }

    // ── MODULE: Payroll Management
    if (module === 'payroll') {
      const employees = primary?.employeeCount || 25;
      const avgSalary = 45000;
      const grossPayroll = employees * avgSalary;
      const pf = Math.round(grossPayroll * 0.12);
      const esi = Math.round(grossPayroll * 0.0325);
      const tds = Math.round(grossPayroll * 0.08);
      const profTax = employees * 200;
      const netPayroll = grossPayroll - pf - esi - tds - profTax;

      return NextResponse.json({
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        headcount: employees,
        payrollSummary: {
          grossSalaries: grossPayroll,
          providentFund: pf,
          esi,
          tdsSalary: tds,
          professionalTax: profTax,
          netDisbursement: netPayroll,
        },
        statutory: [
          { name: 'EPF Deposit (Employer + Employee)', amount: pf * 2, dueDate: '15th of month', status: 'DUE' },
          { name: 'ESI Deposit', amount: esi * 2, dueDate: '15th of month', status: 'DUE' },
          { name: 'TDS Deposit (Salary)', amount: tds, dueDate: '7th next month', status: 'DUE' },
          { name: 'Professional Tax', amount: profTax, dueDate: '30th of month', status: 'DUE' },
        ],
        complianceForms: [
          { form: 'ECR (EPF Monthly)', due: '25th of month', status: 'PENDING' },
          { form: 'ESIC Monthly Return', due: '11th of month', status: 'PENDING' },
          { form: 'PT Challan', due: 'Monthly', status: 'PENDING' },
          { form: 'Form 24Q (TDS)', due: 'Quarterly', status: 'UPCOMING' },
        ]
      });
    }

    // ── MODULE: Audit Checklist
    if (module === 'audit') {
      const revenue = primary?.annualRevenue || 10000000;
      const requiresTaxAudit = revenue > 10000000;
      const requiresStatutory = org?.planType === 'ENTERPRISE';

      return NextResponse.json({
        company: primary?.name || org?.name,
        auditType: requiresStatutory ? 'Statutory + Tax Audit' : requiresTaxAudit ? 'Tax Audit (44AB)' : 'Internal Audit',
        taxAuditRequired: requiresTaxAudit,
        turoverThreshold: 10000000,
        revenue,
        dueDate: '30 September',
        checklist: [
          { category: 'Books of Accounts', item: 'Trial Balance verified', status: 'PENDING', priority: 'HIGH' },
          { category: 'Books of Accounts', item: 'Bank Reconciliation Statements', status: 'PENDING', priority: 'HIGH' },
          { category: 'GST', item: 'GSTR-2A vs Purchase Register reconciliation', status: 'PENDING', priority: 'HIGH' },
          { category: 'GST', item: 'Output tax liability verification', status: 'PENDING', priority: 'MEDIUM' },
          { category: 'TDS', item: 'TDS deducted vs Form 26AS reconciliation', status: 'PENDING', priority: 'HIGH' },
          { category: 'Fixed Assets', item: 'FA register with depreciation schedule', status: 'PENDING', priority: 'MEDIUM' },
          { category: 'Loans', item: 'Loan schedules and interest calculations', status: 'PENDING', priority: 'MEDIUM' },
          { category: 'Investments', item: 'Investment portfolio valuation', status: 'PENDING', priority: 'LOW' },
          { category: 'Closing Stock', item: 'Stock verification and valuation report', status: 'PENDING', priority: 'HIGH' },
          { category: 'Related Party', item: 'Related party transactions disclosure', status: 'PENDING', priority: 'HIGH' },
          { category: 'ROC', item: 'Annual return MCA portal filing', status: 'PENDING', priority: 'MEDIUM' },
          { category: 'Income Tax', item: 'Advance tax payment verification', status: 'PENDING', priority: 'HIGH' },
        ],
        forms: [
          { form: 'Form 3CA-3CD (Tax Audit Report)', due: '30 Sep', status: requiresTaxAudit ? 'REQUIRED' : 'NOT REQUIRED' },
          { form: 'ITR-6 (Company Return)', due: '31 Oct', status: 'PENDING' },
          { form: 'Form AOC-4 (Financial Statements)', due: '30 Oct', status: 'PENDING' },
          { form: 'Form MGT-7 (Annual Return)', due: '31 Oct', status: 'PENDING' },
        ]
      });
    }

    // ── MODULE: ITR / Tax Filing
    if (module === 'itr') {
      const revenue = primary?.annualRevenue || 10000000;
      const taxableIncome = Math.round(revenue * 0.15);
      const taxAt25 = Math.round(taxableIncome * 0.25);
      const surcharge = taxableIncome > 10000000 ? Math.round(taxAt25 * 0.07) : 0;
      const cess = Math.round((taxAt25 + surcharge) * 0.04);
      const totalTax = taxAt25 + surcharge + cess;
      const advanceTaxPaid = Math.round(totalTax * 0.60);
      const tdsCredit = Math.round(totalTax * 0.15);
      const selfAssessment = totalTax - advanceTaxPaid - tdsCredit;

      const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const advanceTaxSchedule = [
        { installment: '1st (15 Jun)', percent: '15%', amount: Math.round(totalTax * 0.15), status: 'PAID' },
        { installment: '2nd (15 Sep)', percent: '45%', amount: Math.round(totalTax * 0.30), status: quarter >= 2 ? 'PAID' : 'UPCOMING' },
        { installment: '3rd (15 Dec)', percent: '75%', amount: Math.round(totalTax * 0.30), status: quarter >= 3 ? 'PAID' : 'UPCOMING' },
        { installment: '4th (15 Mar)', percent: '100%', amount: Math.round(totalTax * 0.25), status: quarter >= 4 ? 'PAID' : 'UPCOMING' },
      ];

      return NextResponse.json({
        fy: `FY ${new Date().getFullYear()}`,
        assessmentYear: `AY ${new Date().getFullYear() + 1}-${(new Date().getFullYear() + 2).toString().slice(2)}`,
        regime: 'New Tax Regime (Section 115BAA)',
        grossRevenue: revenue,
        allowableDeductions: Math.round(revenue * 0.08),
        taxableIncome,
        taxAt25,
        surcharge,
        healthAndEducationCess: cess,
        totalTaxLiability: totalTax,
        advanceTaxPaid,
        tdsCredited: tdsCredit,
        selfAssessmentTax: Math.max(0, selfAssessment),
        interestOn234B: selfAssessment > 0 ? Math.round(selfAssessment * 0.01) : 0,
        advanceTaxSchedule,
        itrForm: revenue > 50000000 ? 'ITR-6' : 'ITR-5',
        filingDueDate: '31 October',
        status: 'PENDING',
      });
    }

    // ── MODULE: MCA/ROC Compliance
    if (module === 'mca') {
      const fy = new Date().getFullYear();
      return NextResponse.json({
        cin: primary?.cin || 'Not Linked',
        company: primary?.name || org?.name,
        legalType: primary?.legalType || 'PRIVATE_LIMITED',
        filings: [
          { form: 'MGT-7 (Annual Return)', due: `31 Oct ${fy}`, description: 'Filed with Registrar covering shareholding, directors, and key events.', status: 'PENDING', fee: 600 },
          { form: 'AOC-4 (Financial Statements)', due: `30 Oct ${fy}`, description: 'Balance Sheet, P&L, and auditor report submission to MCA.', status: 'PENDING', fee: 500 },
          { form: 'DIR-3 KYC (Director KYC)', due: `30 Sep ${fy}`, description: 'Annual DIN KYC for all active directors on MCA portal.', status: primary?.directors ? 'ACTION REQUIRED' : 'PENDING', fee: 0 },
          { form: 'DPT-3 (Deposits Return)', due: `30 Jun ${fy}`, description: 'Return of deposits and loans outstanding.', status: 'FILED', fee: 0 },
          { form: 'MSME-1 (MSME Payment)', due: `31 Oct ${fy}`, description: 'Disclosure of outstanding dues to MSME suppliers.', status: 'PENDING', fee: 0 },
        ],
        boardMeetings: {
          required: 4,
          held: 2,
          nextDue: `${new Date().getMonth() < 9 ? 'Sep' : 'Dec'} ${fy}`,
          gap: '120 days max'
        },
        directors: primary?.directors ? primary.directors.split(';').map(d => ({ name: d.trim(), kycStatus: 'PENDING' })) : [],
        penalties: primary?.cin ? [] : [{ rule: 'Section 12 CA 2013', risk: 'Heavy penalty for non-filing beyond 30 days of due date' }]
      });
    }

    return NextResponse.json({ error: 'Unknown module' }, { status: 400 });

  } catch (err: any) {
    console.error('CA API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
