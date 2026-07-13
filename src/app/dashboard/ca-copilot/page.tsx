'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator, FileText, Users, ClipboardCheck, TrendingUp,
  Building2, AlertTriangle, CheckCircle, Clock, ArrowUpRight,
  RefreshCw, ChevronDown, ChevronRight, Sparkles, IndianRupee,
  BarChart3, Shield, BookOpen, Briefcase, Scale, Download, Plus, Play, Trash2
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
type CopilotType = 'ca' | 'cs' | 'legal';
type Module = 'summary' | 'gst' | 'tds' | 'pnl' | 'payroll' | 'audit' | 'itr' | 'mca';

const MODULES: { id: Module; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'gst',     label: 'GST Filing',         icon: <FileText size={20} />,       color: '#8B5CF6', desc: 'GSTR-1, GSTR-3B, ITC Reconciliation' },
  { id: 'tds',     label: 'TDS / TCS',          icon: <Calculator size={20} />,     color: '#2563EB', desc: 'Deductions, Challans, Form 24Q/26Q' },
  { id: 'pnl',     label: 'P&L Statement',      icon: <TrendingUp size={20} />,     color: '#10B981', desc: 'Financials, Margins, Key Ratios' },
  { id: 'payroll', label: 'Payroll',             icon: <Users size={20} />,          color: '#F59E0B', desc: 'Salary, EPF, ESI, Professional Tax' },
  { id: 'audit',   label: 'Audit Checklist',    icon: <ClipboardCheck size={20} />, color: '#EF4444', desc: 'Tax Audit 44AB, Statutory, Internal' },
  { id: 'itr',     label: 'Income Tax / ITR',   icon: <Scale size={20} />,          color: '#06B6D4', desc: 'Tax Computation, Advance Tax, Filing' },
  { id: 'mca',     label: 'MCA / ROC',          icon: <Building2 size={20} />,      color: '#EC4899', desc: 'MGT-7, AOC-4, Director KYC, DIN' },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    FILED: 'badge-success', PAID: 'badge-success', 'ACTION REQUIRED': 'badge-danger',
    PENDING: 'badge-warning', UPCOMING: 'badge-info', PARTIAL: 'badge-warning',
    REQUIRED: 'badge-danger', 'NOT REQUIRED': 'badge-success', DUE: 'badge-danger',
  };
  return map[status] || 'badge-info';
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Sub-panels ──────────────────────────────────────────

function SummaryPanel({ data }: { data: any }) {
  if (!data) return null;
  const s = data.summary;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
        {[
          { label: 'Annual Revenue', value: fmt(s.totalRevenue), icon: <IndianRupee size={22} />, color: '#10B981' },
          { label: 'Companies Tracked', value: s.companiesTracked, icon: <Building2 size={22} />, color: '#2563EB' },
          { label: 'Documents Vaulted', value: s.documentsVaulted, icon: <BookOpen size={22} />, color: '#8B5CF6' },
          { label: 'GSTIN', value: s.gstin || '—', icon: <FileText size={22} />, color: '#F59E0B' },
          { label: 'PAN', value: s.pan || '—', icon: <Shield size={22} />, color: '#EC4899' },
          { label: 'Risk Score', value: `${s.avgRiskScore}/100`, icon: <BarChart3 size={22} />, color: s.avgRiskScore > 60 ? '#EF4444' : '#10B981' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${c.color}18`, color: c.color, display: 'flex', alignItems: 'center', justifyContainer: 'center', flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.15rem' }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: '#8B5CF6' }} /> AI CA Compliance Calendar
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { task: 'GSTR-1 Monthly Filing', due: '11th of next month', urgency: 'HIGH', tag: 'GST' },
            { task: 'GSTR-3B Payment & Filing', due: '20th of next month', urgency: 'HIGH', tag: 'GST' },
            { task: 'TDS Deposit (Salary & Contractors)', due: '7th of next month', urgency: 'HIGH', tag: 'TDS' },
            { task: 'EPF & ESI Deposit', due: '15th of next month', urgency: 'MEDIUM', tag: 'Payroll' },
            { task: 'Advance Tax Installment', due: '15 Sep / 15 Dec', urgency: 'MEDIUM', tag: 'Income Tax' },
            { task: 'ROC Annual Return (MGT-7)', due: '31 October', urgency: 'LOW', tag: 'MCA' },
            { task: 'Tax Audit Report (Form 3CD)', due: '30 September', urgency: 'LOW', tag: 'Audit' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--muted)' }}>{t.tag}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.task}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Due: {t.due}</span>
                <span className={`badge ${t.urgency === 'HIGH' ? 'badge-danger' : t.urgency === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>{t.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GSTPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'Estimated Turnover', value: fmt(data.turnover), color: '#2563EB' },
          { label: 'Output Tax (18%)', value: fmt(data.outputTax), color: '#EF4444' },
          { label: 'Input Tax Credit', value: fmt(data.inputTaxCredit), color: '#10B981' },
          { label: 'Net GST Payable', value: fmt(data.netPayable), color: '#F59E0B' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700 }}>Filing Calendar – {data.fy}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Compliance Score:</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: data.complianceScore > 75 ? '#10B981' : '#F59E0B' }}>{data.complianceScore}%</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Form', 'Period', 'Due Date', 'Tax Liability', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.filings.map((f: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>{f.form}</td>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--muted)' }}>{f.period}</td>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--muted)' }}>{f.dueDate}</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{f.liability ? fmt(f.liability) : '—'}</td>
                <td style={{ padding: '0.85rem 0.75rem' }}><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>AI GST Advisor Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.recommendations.map((r: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Sparkles size={16} style={{ color: '#8B5CF6', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem' }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TDSPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'Total TDS Deducted', value: fmt(data.totalDeducted), color: '#2563EB' },
          { label: 'Challan Deposited', value: fmt(data.challanDeposited), color: '#10B981' },
          { label: 'Outstanding Liability', value: fmt(data.outstandingLiability), color: '#EF4444' },
          { label: 'Interest Risk (1.5%/mo)', value: fmt(data.interestRisk), color: '#F59E0B' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Section-wise TDS Breakdown – {data.quarter} {data.fy}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Section', 'Estimated TDS', 'Deposited', 'Gap', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.deductions.map((d: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{d.section}</td>
                <td style={{ padding: '0.85rem 0.75rem' }}>{fmt(d.estimated)}</td>
                <td style={{ padding: '0.85rem 0.75rem', color: '#10B981', fontWeight: 600 }}>{fmt(d.deposited)}</td>
                <td style={{ padding: '0.85rem 0.75rem', color: d.estimated - d.deposited > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>{fmt(Math.max(0, d.estimated - d.deposited))}</td>
                <td style={{ padding: '0.85rem 0.75rem' }}><span className={`badge ${statusBadge(d.status)}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>TDS Return Filing Schedule</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.forms.map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{f.form}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{f.quarter} — Due: {f.dueDate}</div>
              </div>
              <span className={`badge ${statusBadge(f.status)}`}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PnLPanel({ data }: { data: any }) {
  if (!data) return null;
  const { income, expenses, metrics, ratios } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'Gross Margin', value: `${metrics.grossMargin}%`, color: '#10B981' },
          { label: 'EBITDA Margin', value: `${metrics.ebitdaMargin}%`, color: '#2563EB' },
          { label: 'PAT Margin', value: `${metrics.patMargin}%`, color: '#8B5CF6' },
          { label: 'Net Profit (PAT)', value: fmt(metrics.pat), color: metrics.pat > 0 ? '#10B981' : '#EF4444' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Income Statement */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Income Statement – {data.period}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            {[
              { label: 'Operating Revenue', value: income.operatingRevenue, indent: 0, bold: false },
              { label: 'Other Income', value: income.otherIncome, indent: 1, bold: false },
              { label: 'Total Income', value: income.totalIncome, indent: 0, bold: true, color: '#2563EB' },
              { label: '', value: null, indent: 0, bold: false },
              { label: 'Cost of Goods Sold', value: -expenses.cogs, indent: 1, bold: false },
              { label: 'Employee Costs', value: -expenses.employeeBenefits, indent: 1, bold: false },
              { label: 'Rent & Utilities', value: -expenses.rentUtilities, indent: 1, bold: false },
              { label: 'Admin Overheads', value: -expenses.adminOverheads, indent: 1, bold: false },
              { label: 'Gross Profit', value: metrics.grossProfit, indent: 0, bold: true, color: '#10B981' },
              { label: 'EBITDA', value: metrics.ebitda, indent: 0, bold: true, color: '#10B981' },
              { label: 'Depreciation', value: -expenses.depreciation, indent: 1, bold: false },
              { label: 'Finance Costs', value: -expenses.financeCosts, indent: 1, bold: false },
              { label: 'Profit Before Tax', value: metrics.pbt, indent: 0, bold: true },
              { label: 'Tax (25%)', value: -metrics.tax, indent: 1, bold: false },
              { label: 'Net Profit (PAT)', value: metrics.pat, indent: 0, bold: true, color: metrics.pat > 0 ? '#10B981' : '#EF4444' },
            ].map((row, i) => row.value === null ? (
              <div key={i} style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
            ) : (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: `${row.indent}rem`, paddingTop: '0.2rem' }}>
                <span style={{ fontWeight: row.bold ? 700 : 400, color: row.color || 'var(--foreground)' }}>{row.label}</span>
                <span style={{ fontWeight: row.bold ? 700 : 400, color: row.color || (row.value < 0 ? '#EF4444' : 'var(--foreground)') }}>
                  {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Key Financial Ratios</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Current Ratio', value: ratios.currentRatio, benchmark: '≥ 2.0', good: ratios.currentRatio >= 2 },
              { name: 'Quick Ratio', value: ratios.quickRatio, benchmark: '≥ 1.0', good: ratios.quickRatio >= 1 },
              { name: 'Debt / Equity', value: ratios.debtToEquity, benchmark: '≤ 1.5', good: ratios.debtToEquity <= 1.5 },
              { name: 'Interest Coverage', value: `${ratios.interestCoverage}x`, benchmark: '≥ 3x', good: ratios.interestCoverage >= 3 },
              { name: 'Return on Equity', value: `${ratios.returnOnEquity}%`, benchmark: '≥ 15%', good: ratios.returnOnEquity >= 15 },
              { name: 'Return on Assets', value: `${ratios.returnOnAssets}%`, benchmark: '≥ 5%', good: ratios.returnOnAssets >= 5 },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: `1px solid ${r.good ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '8px', background: r.good ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>Benchmark: {r.benchmark}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: r.good ? '#10B981' : '#EF4444' }}>{r.value}</span>
                  {r.good ? <CheckCircle size={16} style={{ color: '#10B981' }} /> : <AlertTriangle size={16} style={{ color: '#EF4444' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollPanel({ data }: { data: any }) {
  if (!data) return null;
  const { payrollSummary: ps, statutory, complianceForms } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'Headcount', value: data.headcount, color: '#2563EB' },
          { label: 'Gross Payroll', value: fmt(ps.grossSalaries), color: '#F59E0B' },
          { label: 'Net Disbursement', value: fmt(ps.netDisbursement), color: '#10B981' },
          { label: 'Statutory Deductions', value: fmt(ps.providentFund + ps.esi + ps.tdsSalary + ps.professionalTax), color: '#EF4444' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Payroll Breakup – {data.month}</h3>
          {[
            { label: 'Gross Salaries', value: ps.grossSalaries, color: 'var(--foreground)' },
            { label: 'Provident Fund (12%)', value: ps.providentFund, color: '#EF4444' },
            { label: 'ESI (3.25%)', value: ps.esi, color: '#EF4444' },
            { label: 'TDS on Salary', value: ps.tdsSalary, color: '#EF4444' },
            { label: 'Professional Tax', value: ps.professionalTax, color: '#EF4444' },
            { label: 'Net Take-Home', value: ps.netDisbursement, color: '#10B981' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.color }}>{fmt(r.value)}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Statutory Deposits Due</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statutory.map((s: any, i: number) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</span>
                  <span className={`badge ${statusBadge(s.status)}`}>{s.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span>Due: {s.dueDate}</span>
                  <span style={{ fontWeight: 700, color: '#EF4444' }}>{fmt(s.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Compliance Returns Calendar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
          {complianceForms.map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{f.form}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>Due: {f.due}</div>
              </div>
              <span className={`badge ${statusBadge(f.status)}`}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditPanel({ data }: { data: any }) {
  if (!data) return null;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const progress = Math.round((checked.size / data.checklist.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontWeight: 700 }}>Audit Type: {data.auditType}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Filing Due: <strong>{data.dueDate}</strong> &nbsp;|&nbsp; Turnover: {fmt(data.revenue)}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: progress === 100 ? '#10B981' : '#2563EB' }}>{progress}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Checklist Done</div>
          </div>
        </div>
        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2563EB, #10B981)', borderRadius: '4px', transition: 'width 0.4s' }} />
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Interactive Audit Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {data.checklist.map((item: any, i: number) => (
            <label key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: `1px solid ${checked.has(i) ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: '10px', cursor: 'pointer', background: checked.has(i) ? 'rgba(16,185,129,0.04)' : 'var(--background)', transition: 'all 0.2s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${checked.has(i) ? '#10B981' : 'var(--border)'}`, background: checked.has(i) ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {checked.has(i) && <CheckCircle size={12} style={{ color: 'white' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, textDecoration: checked.has(i) ? 'line-through' : 'none', color: checked.has(i) ? 'var(--muted)' : 'var(--foreground)' }}>{item.item}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>{item.category}</span>
              </div>
              <span className={`badge ${item.priority === 'HIGH' ? 'badge-danger' : item.priority === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>{item.priority}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Statutory Forms & Deadlines</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.forms.map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{f.form}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1' }}>Due: {f.due}</div>
              </div>
              <span className={`badge ${statusBadge(f.status)}`}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ITRPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'Taxable Income', value: fmt(data.taxableIncome), color: '#2563EB' },
          { label: 'Total Tax Liability', value: fmt(data.totalTaxLiability), color: '#EF4444' },
          { label: 'Advance Tax Paid', value: fmt(data.advanceTaxPaid), color: '#10B981' },
          { label: 'Self Assessment Tax', value: fmt(data.selfAssessmentTax), color: data.selfAssessmentTax > 0 ? '#F59E0B' : '#10B981' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Tax Computation – {data.assessmentYear}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { label: 'Gross Revenue', value: fmt(data.grossRevenue) },
              { label: 'Less: Allowable Deductions', value: `(${fmt(data.allowableDeductions)})` },
              { label: 'Taxable Income', value: fmt(data.taxableIncome), bold: true },
              { label: '', value: '' },
              { label: `Tax at 25% (Sec 115BAA)`, value: fmt(data.taxAt25) },
              { label: 'Surcharge (if applicable)', value: fmt(data.surcharge) },
              { label: 'Health & Education Cess (4%)', value: fmt(data.healthAndEducationCess) },
              { label: 'Total Tax Liability', value: fmt(data.totalTaxLiability), bold: true, color: '#EF4444' },
              { label: '', value: '' },
              { label: 'Advance Tax Paid', value: `(${fmt(data.advanceTaxPaid)})` },
              { label: 'TDS Credit', value: `(${fmt(data.tdsCredited)})` },
              { label: 'Self Assessment Tax Payable', value: fmt(data.selfAssessmentTax), bold: true, color: data.selfAssessmentTax > 0 ? '#F59E0B' : '#10B981' },
              { label: 'Interest u/s 234B (est.)', value: fmt(data.interestOn234B), color: '#EF4444' },
            ].map((r, i) => r.label === '' ? (
              <div key={i} style={{ height: '1px', background: 'var(--border)', margin: '0.4rem 0' }} />
            ) : (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                <span style={{ fontWeight: r.bold ? 700 : 500, color: r.color || 'var(--foreground)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Advance Tax Installment Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.advanceTaxSchedule.map((inst: any, i: number) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{inst.installment}</span>
                  <span className={`badge ${statusBadge(inst.status)}`}>{inst.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span>Cumulative: {inst.percent}</span>
                  <span style={{ fontWeight: 700, color: '#2563EB' }}>{fmt(inst.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '0.4rem' }}>ITR FILING DETAILS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Form</span><strong>{data.itrForm}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <span>Filing Deadline</span><strong style={{ color: '#F59E0B' }}>{data.filingDueDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              <span>Regime</span><strong>{data.regime}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MCAPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {[
          { label: 'CIN', value: data.cin, color: '#2563EB' },
          { label: 'Legal Type', value: data.legalType?.replace('_', ' '), color: '#8B5CF6' },
          { label: 'Board Meetings Held', value: `${data.boardMeetings?.held} / ${data.boardMeetings?.required}`, color: '#10B981' },
          { label: 'Next Board Meeting', value: data.boardMeetings?.nextDue, color: '#F59E0B' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: m.color }}>{m.value || '—'}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>MCA Filing Calendar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.filings.map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{f.form}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2' }}>{f.description}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1' }}>Due: <strong>{f.due}</strong> {f.fee > 0 && `· Fee: ₹${f.fee}`}</div>
              </div>
              <span className={`badge ${statusBadge(f.status)}`} style={{ flexShrink: 0, marginLeft: '1rem' }}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>

      {data.penalties?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#EF4444', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={18} /> Compliance Risk Alerts
          </h3>
          {data.penalties.map((p: any, i: number) => (
            <div key={i} style={{ padding: '0.85rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>{p.rule}</strong>: {p.risk}
            </div>
          ))}
        </div>
      )}

      {data.directors?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Director KYC Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
            {data.directors.map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</span>
                </div>
                <span className={`badge ${statusBadge(d.kycStatus)}`}>{d.kycStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NEW PANELS: Company Secretary & Legal Copilots ───────────────────────────

function CompanySecretaryPanel() {
  const [resolutionType, setResolutionType] = useState('director_appointment');
  const [directorName, setDirectorName] = useState('Aditya Vardhan');
  const [dinNumber, setDinNumber] = useState('00982761');
  const [generatedDraft, setGeneratedDraft] = useState('');

  const generateDraft = () => {
    if (resolutionType === 'director_appointment') {
      setGeneratedDraft(`BOARD RESOLUTION OF PROVENTA ENTERPRISE SOLUTIONS PRIVATE LIMITED
HELD ON ${new Date().toLocaleDateString('en-IN')} AT THE REGISTERED OFFICE

RESOLVED THAT pursuant to the provisions of Section 152 and other applicable provisions of the Companies Act, 2013, Mr. ${directorName} (DIN: ${dinNumber}) who has consented to act as director, be and is hereby appointed as an Additional Director of the Company with immediate effect, to hold office up to the date of the next Annual General Meeting.

RESOLVED FURTHER THAT any Director of the Company be and is hereby authorized to file Form DIR-12 with the Registrar of Companies (ROC) and do all necessary acts to give effect to this resolution.

CERTIFIED TRUE COPY,
For Proventa Enterprise Solutions Private Limited
Director / Co-Secretary`);
    } else if (resolutionType === 'bank_account') {
      setGeneratedDraft(`BOARD RESOLUTION FOR OPENING A CORPORATE BANK ACCOUNT
PROVENTA ENTERPRISE SOLUTIONS PRIVATE LIMITED

RESOLVED THAT a current banking account in the name of the Company be opened with ICICI Bank Limited, Corporate Branch, for facilitating credit reconciliation transactions.

RESOLVED FURTHER THAT Mr. ${directorName} (DIN: ${dinNumber}), Director of the Company, be and is hereby authorized to sign the account opening forms, execute agreements, and operate the banking portal u/s 179 on behalf of the Company.

CERTIFIED TRUE COPY,
For Proventa Enterprise Solutions Private Limited
Director / Co-Secretary`);
    } else {
      setGeneratedDraft(`BOARD RESOLUTION FOR ISSUANCE OF SHARES
PROVENTA ENTERPRISE SOLUTIONS PRIVATE LIMITED

RESOLVED THAT pursuant to Section 62(1)(a) of the Companies Act, 2013, the consent of the Board be and is hereby accorded to allot 10,000 Equity Shares of face value ₹10 each at a premium of ₹90 per share, to the subscribers listed in the share allocation register.

RESOLVED FURTHER THAT Share Certificates be issued under the common seal of the Company signed by authorized signatory Mr. ${directorName}.

CERTIFIED TRUE COPY,
For Proventa Enterprise Solutions Private Limited
Director / Co-Secretary`);
    }
  };

  const downloadDraft = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Board_Resolution_${resolutionType}.txt`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Form builder */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            AI Board Resolution Template Builder
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Resolution Class Category</label>
              <select className="form-input" value={resolutionType} onChange={(e) => setResolutionType(e.target.value)} style={{ margin: 0 }}>
                <option value="director_appointment">Appointment of Additional Director</option>
                <option value="bank_account">Opening Corporate Bank Account</option>
                <option value="share_issuance">Allotment of Equity Shares</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Authorized Director / Representative Name</label>
              <input type="text" className="form-input" value={directorName} onChange={(e) => setDirectorName(e.target.value)} style={{ margin: 0 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Director Identification Number (DIN)</label>
              <input type="text" className="form-input" value={dinNumber} onChange={(e) => setDinNumber(e.target.value)} style={{ margin: 0 }} />
            </div>

            <button onClick={generateDraft} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Sparkles size={16} />
              Compile Resolution Draft
            </button>
          </div>
        </div>

        {/* Live Calendar ROC */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--muted)' }}>ROC Secretarial Calendar</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
            {[
              { item: 'DIR-3 KYC filings', due: '30-Sep-2026', status: 'PENDING' },
              { item: 'AOC-4 Financial Statements', due: '30-Oct-2026', status: 'UPCOMING' },
              { item: 'MGT-7 Annual ROC Return', due: '29-Nov-2026', status: 'UPCOMING' },
              { item: 'DPT-3 Return of Deposits', due: '30-Jun-2026', status: 'COMPLETED' }
            ].map((c, i) => (
              <div key={i} style={{ padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block' }}>{c.item}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Due: {c.due}</span>
                </div>
                <span className={`badge ${c.status === 'COMPLETED' ? 'badge-success' : c.status === 'PENDING' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Output draft review */}
      {generatedDraft && (
        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1rem' }}>Generated Resolution Output Review</strong>
            <button onClick={downloadDraft} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Download size={12} /> Download Draft (.txt)
            </button>
          </div>
          <pre style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            color: 'var(--foreground)'
          }}>
            {generatedDraft}
          </pre>
        </div>
      )}
    </div>
  );
}

function LegalCopilotPanel() {
  const [contractText, setContractText] = useState(`This Agreement is made on 12-Jul-2026 between Client Co and Supplier Co.
Indemnity: Supplier Co agrees to indemnify and hold harmless Client Co against any and all liabilities, losses, and litigation claims arising from supply delays, up to an unlimited liability threshold.
Payment terms: All payments shall be processed within Net-60 days. Default interest rate for late payment is exempted.`);
  const [scanning, setScanning] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  const [debtorName, setDebtorName] = useState('Acme Corp');
  const [invoiceRef, setInvoiceRef] = useState('INV-2026-928');
  const [dueAmount, setDueAmount] = useState('4,50,000');
  const [noticeDraft, setNoticeDraft] = useState('');

  const scanContract = () => {
    setScanning(true);
    setTimeout(() => {
      setRiskAssessment({
        score: 72,
        issues: [
          { clause: 'Indemnity', risk: 'UNLIMITED LIABILITY CLAUSE', desc: 'Supplier takes full liability buffer. Restrict threshold caps to 100% of contract value.', severity: 'CRITICAL' },
          { clause: 'Payment terms', risk: 'NET-60 PAYMENT GATE', desc: 'Net-60 days creates major capital lockdown. Renegotiate to standard Net-30 intervals.', severity: 'HIGH' },
          { clause: 'Late default', risk: 'INTEREST RATE EXEMPTION', desc: 'No penalty on default payments. Add 1.5% monthly default interest rate protection terms.', severity: 'MEDIUM' }
        ]
      });
      setScanning(false);
    }, 1200);
  };

  const generateNotice = () => {
    setNoticeDraft(`FORMAL LEGAL NOTICE OF DEMAND FOR OUTSTANDING PAYMENT
UNDER SECTION 138 OF NI ACT / COMMERCIAL LAWS OF INDIA

Date: ${new Date().toLocaleDateString('en-IN')}

To,
The Board of Directors,
${debtorName} Private Limited

SUBJECT: DEMAND FOR OUTSTANDING PAYMENT AGAINST INVOICE REF: ${invoiceRef}

Dear Sir/Madam,

Under instructions from our client, Proventa Enterprise Solutions Private Limited, we hereby serve you with this formal legal notice of demand.

You have defaulted on payment against invoice reference ${invoiceRef} amounting to ₹${dueAmount} which fell due on past accounts. Despite multiple payment reminders, the outstanding amount remains unpaid, resulting in commercial delay penalties.

YOU ARE HEREBY CALLED UPON to pay the entire outstanding amount of ₹${dueAmount} together with interest at 18% per annum within 15 days of receipt of this notice, failing which our client shall initiate civil recovery litigations and NCLT insolvency proceedings u/s 9 of IBC.

Yours faithfully,
For Proventa Legal Associates
Senior Advocate`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      
      {/* Contract Scanner & Demand notice grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Scanner */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <Scale size={18} style={{ color: 'var(--primary)' }} />
            AI Contract Risk & Indemnity Clause Scanner
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              className="form-input" 
              rows={6} 
              value={contractText} 
              onChange={(e) => setContractText(e.target.value)} 
              style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            
            <button onClick={scanContract} disabled={scanning} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Running AI Clause scanner...' : 'Analyze Contract Risk'}
            </button>
          </div>
        </div>

        {/* Demand notice form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <FileText size={18} style={{ color: 'var(--secondary)' }} />
            Legal Recovery Notice Drafts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Debtor Legal Entity</label>
              <input type="text" className="form-input" value={debtorName} onChange={(e) => setDebtorName(e.target.value)} style={{ margin: 0 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Invoice Ref</label>
                <input type="text" className="form-input" value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} style={{ margin: 0 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount Due (₹)</label>
                <input type="text" className="form-input" value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} style={{ margin: 0 }} />
              </div>
            </div>

            <button onClick={generateNotice} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
              <Sparkles size={14} />
              Draft Demand Notice
            </button>
          </div>
        </div>
      </div>

      {/* Scanner results */}
      {riskAssessment && (
        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <strong style={{ fontSize: '1.1rem' }}>AI Clause Audit Results Matrix</strong>
            <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>Risk Score: {riskAssessment.score}/100</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {riskAssessment.issues.map((issue: any, i: number) => (
              <div key={i} style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${issue.severity === 'CRITICAL' ? 'var(--danger)' : issue.severity === 'HIGH' ? '#F59E0B' : 'var(--primary)'}`,
                borderRadius: '8px',
                background: 'var(--background)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>{issue.clause}: {issue.risk}</strong>
                  <span className={`badge ${issue.severity === 'CRITICAL' ? 'badge-danger' : issue.severity === 'HIGH' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>{issue.severity}</span>
                </div>
                <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{issue.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice display output */}
      {noticeDraft && (
        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1rem' }}>Formal Notice Output Preview</strong>
            <button onClick={() => {
              const blob = new Blob([noticeDraft], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Legal_Notice_Demand_${debtorName.replace(/\s+/g, '_')}.txt`;
              a.click();
            }} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Download size={12} /> Download notice (.txt)
            </button>
          </div>
          <pre style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            color: 'var(--foreground)'
          }}>
            {noticeDraft}
          </pre>
        </div>
      )}

    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function CACopilotPage() {
  const [copilotTab, setCopilotTab] = useState<CopilotType>('ca');
  const [activeModule, setActiveModule] = useState<Module>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = useCallback(async (mod: Module) => {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/dashboard/ca?module=${mod}`);
      if (res.ok) setData(await res.json());
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/dashboard/ca?module=summary').then(r => r.ok ? r.json() : null).then(d => { if (d) setSummary(d); });
    fetchData(activeModule);
  }, []);

  const handleModuleChange = (mod: Module) => {
    setActiveModule(mod);
    fetchData(mod);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header with Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={32} style={{ color: 'var(--primary)' }} />
            AI Compliance & Audit Center
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Automate tax schedules, board resolutions, ROC filings, and legal notice generation.
          </p>
        </div>

        {/* Switcher Tab */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--secondary)', padding: '0.3rem', borderRadius: '10px' }}>
          {[
            { id: 'ca', label: 'AI Chartered Accountant', icon: <Briefcase size={14} /> },
            { id: 'cs', label: 'AI Company Secretary', icon: <Shield size={14} /> },
            { id: 'legal', label: 'AI Legal Copilot', icon: <Scale size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCopilotTab(tab.id as CopilotType)}
              style={{
                background: copilotTab === tab.id ? 'var(--card)' : 'transparent',
                color: copilotTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: copilotTab === tab.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER TAB 1: CA Copilot */}
      {copilotTab === 'ca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Module Selector Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '0.75rem' }}>
            {/* Summary Card */}
            <div
              onClick={() => handleModuleChange('summary')}
              className="card"
              style={{
                padding: '1rem 0.75rem', cursor: 'pointer', textAlign: 'center',
                border: activeModule === 'summary' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: activeModule === 'summary' ? 'rgba(37,99,235,0.04)' : 'var(--card)',
                transition: 'all 0.2s'
              }}
            >
              <BarChart3 size={22} style={{ color: activeModule === 'summary' ? 'var(--primary)' : 'var(--muted)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: activeModule === 'summary' ? 'var(--primary)' : 'var(--muted)' }}>Overview</div>
            </div>

            {MODULES.map(m => (
              <div
                key={m.id}
                onClick={() => handleModuleChange(m.id)}
                className="card"
                style={{
                  padding: '1rem 0.75rem', cursor: 'pointer', textAlign: 'center',
                  border: activeModule === m.id ? `2px solid ${m.color}` : '1px solid var(--border)',
                  background: activeModule === m.id ? `${m.color}08` : 'var(--card)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ color: activeModule === m.id ? m.color : 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{m.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: activeModule === m.id ? m.color : 'var(--muted)' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Active module description */}
          {activeModule !== 'summary' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'var(--secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--foreground)' }}>{MODULES.find(m => m.id === activeModule)?.label}</strong> — {MODULES.find(m => m.id === activeModule)?.desc}
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '1rem', color: 'var(--muted)' }}>
              <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
              AI CA Copilot computing module data...
            </div>
          )}

          {/* Panels */}
          {!loading && data && (
            <>
              {activeModule === 'summary' && <SummaryPanel data={data} />}
              {activeModule === 'gst' && <GSTPanel data={data} />}
              {activeModule === 'tds' && <TDSPanel data={data} />}
              {activeModule === 'pnl' && <PnLPanel data={data} />}
              {activeModule === 'payroll' && <PayrollPanel data={data} />}
              {activeModule === 'audit' && <AuditPanel data={data} />}
              {activeModule === 'itr' && <ITRPanel data={data} />}
              {activeModule === 'mca' && <MCAPanel data={data} />}
            </>
          )}
        </div>
      )}

      {/* RENDER TAB 2: CS Copilot */}
      {copilotTab === 'cs' && <CompanySecretaryPanel />}

      {/* RENDER TAB 3: Legal Copilot */}
      {copilotTab === 'legal' && <LegalCopilotPanel />}

    </div>
  );
}
