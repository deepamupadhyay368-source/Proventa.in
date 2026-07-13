'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Scale, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  Globe2,
  Building,
  User,
  History,
  Activity,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface PortfolioMetrics {
  totalCompaniesTracked: number;
  totalExposure: number;
  highRiskCount: number;
  totalLitigations: number;
  averageCreditScore: number;
}

interface CompanySummary {
  id: string;
  name: string;
  industry: string;
  annualRevenue: number;
  assessment: {
    creditScore: number;
    creditRating: string;
    riskScore: number;
    recommendedLimit: number;
  } | null;
  litigationsCount: number;
}

export default function DashboardOverview() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'rating' | 'aging' | 'dso'>('rating');
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sumRes = await fetch('/api/dashboard/summary');
        if (!sumRes.ok) throw new Error('Unauthenticated');
        const sumJson = await sumRes.json();
        setData(sumJson);

        const repRes = await fetch('/api/dashboard/reports');
        if (repRes.ok) {
          const repJson = await repRes.json();
          setReports(repJson.creditRiskReport);
        }
        setLoading(false);
      } catch (err) {
        router.push('/login');
      }
    };
    loadData();
  }, [router]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  const metrics: PortfolioMetrics = data.portfolioMetrics;
  const portfolio: CompanySummary[] = data.portfolioCompanies || [];
  const ownCompany = data.primaryCompany;

  // Find high risk counterparties
  const highRiskCompanies = portfolio.filter(c => c.assessment && c.assessment.riskScore > 40);

  // SVG Chart rendering data
  const ratings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C', 'D'];
  const ratingDistribution = ratings.map(r => {
    return portfolio.filter(c => c.assessment?.creditRating === r).length;
  });
  const maxCount = Math.max(...ratingDistribution, 1);

  // Gearing Bad Debt percentage estimate (simulated from portfolio average risk score)
  const baseRiskFactor = metrics.averageCreditScore ? (900 - metrics.averageCreditScore) / 600 : 0.35;
  const badDebtRate = +(baseRiskFactor * 8.5 + 1.2).toFixed(1);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>Executive Intelligence Overview</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Real-time Credit scoring, defaults analysis, and legal exposure indexes</p>
        </div>
        <button onClick={() => router.push('/onboarding')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={16} />
          Edit Onboarding Details
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="dashboard-grid">
        {/* Card 1: Own Credit Score */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '4px solid var(--primary)', transition: 'all 0.2s' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(37,99,235,0.08)',
            color: 'var(--primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>Your Credit Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {ownCompany?.assessment?.creditScore || '750'}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 700 }}>
                ({ownCompany?.assessment?.creditRating || 'AA'})
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Exposure Limit */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '4px solid var(--success)', transition: 'all 0.2s' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(16,185,129,0.08)',
            color: 'var(--success)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>Trade Credit Exposure</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              ₹{metrics.totalExposure.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 3: Portfolio average Credit Score */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '4px solid var(--info)', transition: 'all 0.2s' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(6,182,212,0.08)',
            color: 'var(--info)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>Portfolio Avg Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {metrics.averageCreditScore}/900
            </div>
          </div>
        </div>

        {/* Card 4: Litigation and Gearing Risk warnings */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '4px solid var(--danger)', transition: 'all 0.2s' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(239,68,68,0.08)',
            color: 'var(--danger)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>Active Court Disputes</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: metrics.totalLitigations > 0 ? 'var(--danger)' : 'inherit' }}>
              {metrics.totalLitigations}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="dashboard-grid">
        {/* Column Left: Visual distribution & risk indexes */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Multi-metric Risk Trend Charts Panel */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: 0 }}>Trade Portfolio Risk Metrics</h3>
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '8px' }}>
                {[
                  { id: 'rating', label: 'Rating Spread' },
                  { id: 'aging', label: 'A/R Aging' },
                  { id: 'dso', label: 'DSO Target Index' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChartTab(tab.id as any)}
                    style={{
                      background: activeChartTab === tab.id ? 'var(--card)' : 'transparent',
                      color: activeChartTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: activeChartTab === tab.id ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: Rating Spread Chart */}
            {activeChartTab === 'rating' && (
              <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem' }}>
                {ratingDistribution.map((count, index) => {
                  const heightPercentage = (count / maxCount) * 80 + 10;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: count > 0 ? 'var(--primary)' : 'var(--muted)' }}>{count}</span>
                      <div style={{
                        width: '80%',
                        maxWidth: '32px',
                        height: `${heightPercentage}%`,
                        background: count > 0 ? 'linear-gradient(180deg, var(--primary), var(--info))' : 'var(--secondary)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s'
                      }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ratings[index]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Accounts Receivable Aging Chart */}
            {activeChartTab === 'aging' && (
              <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 1rem' }}>
                {[
                  { label: 'Current (0-30d)', val: reports?.agingMatrix?.current || 98000, color: 'var(--success)' },
                  { label: '30-60 Days', val: reports?.agingMatrix?.thirtyToSixty || 28000, color: 'var(--info)' },
                  { label: '60-90 Days', val: reports?.agingMatrix?.sixtyToNinety || 14000, color: 'var(--warning)' },
                  { label: '90+ Days', val: reports?.agingMatrix?.ninetyPlus || 5000, color: 'var(--danger)' }
                ].map((item, idx) => {
                  const maxVal = Math.max(98000, reports?.agingMatrix?.current || 98000);
                  const heightPercentage = (item.val / maxVal) * 80 + 10;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }} className="number-mono">₹{item.val.toLocaleString('en-IN')}</span>
                      <div style={{
                        width: '50%',
                        maxWidth: '36px',
                        height: `${heightPercentage}%`,
                        background: `linear-gradient(180deg, ${item.color}, rgba(0,0,0,0.05))`,
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s'
                      }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: DSO Target Index */}
            {activeChartTab === 'dso' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', height: '120px', alignItems: 'flex-end', gap: '3rem', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }} className="number-mono">{reports?.averageDsoDays || 32.5} Days</span>
                    <div style={{ width: '60px', height: '80px', background: 'linear-gradient(180deg, var(--danger), rgba(239,68,68,0.1))', borderRadius: '8px 8px 0 0' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Average DSO</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }} className="number-mono">{reports?.dsoTargetDays || 30.0} Days</span>
                    <div style={{ width: '60px', height: '74px', background: 'linear-gradient(180deg, var(--success), rgba(16,185,129,0.1))', borderRadius: '8px 8px 0 0' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Threshold</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', background: 'var(--background)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  ⚠️ **DSO Performance Flag**: DSO is currently **2.5 Days** above target threshold. Escalating workflows for aging receivables is recommended.
                </div>
              </div>
            )}
          </div>

          {/* New Full-Width Analytics Insights Row: Funnel & Gearing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* AR Invoices Collection Funnel */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                Invoice Collection Funnel
              </h3>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <svg viewBox="0 0 200 120" style={{ width: '100%', height: '120px' }}>
                    {/* Top: Draft/Generated */}
                    <polygon points="10,10 190,10 165,42 35,42" fill="var(--border)" opacity="0.4" />
                    <text x="100" y="27" textAnchor="middle" fill="var(--foreground)" fontSize="8" fontWeight="bold">DRAFT GENERATED: 100%</text>
                    
                    {/* Middle: Sent / Verified */}
                    <polygon points="35,45 165,45 140,82 60,82" fill="var(--primary)" opacity="0.65" />
                    <text x="100" y="66" textAnchor="middle" fill="var(--foreground)" fontSize="8" fontWeight="bold">SENT / INVOICED: 82%</text>

                    {/* Bottom: Paid / Collected */}
                    <polygon points="60,85 140,85 115,118 85,118" fill="var(--success)" opacity="0.85" />
                    <text x="100" y="103" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">COLLECTED: 58%</text>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Funnel Efficiency:</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--success)' }}>58.2%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Average Velocity:</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>22 Days (Draft ➔ Cash)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bad Debt Gearing Gauge */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifySelf: 'stretch' }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
                Bad Debt Risk Gearing
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }}>
                <svg viewBox="0 0 100 55" style={{ width: '100%', maxWidth: '140px', height: '80px' }}>
                  {/* Gauge Arc */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
                  {/* Active segment based on computed rate */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--danger)" strokeWidth="10" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={125 - (badDebtRate / 10) * 125} />
                  <text x="50" y="45" textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900" fontFamily="Outfit, sans-serif">{badDebtRate}%</text>
                </svg>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '-5px', fontWeight: 600 }}>
                  Expected Default Probability
                </div>
              </div>
            </div>
          </div>

          {/* Table: Full Counterparty scoring */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Corporate Credit Portfolio</h3>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Counterparty Name</th>
                    <th>Industry</th>
                    <th>Credit Rating</th>
                    <th>Risk Factor</th>
                    <th>Limit Cap</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>No counterparties. Onboard a company to generate.</td>
                    </tr>
                  ) : (
                    portfolio.map((c) => {
                      const rating = c.assessment?.creditRating || 'B';
                      const score = c.assessment?.creditScore || 500;
                      const limit = c.assessment?.recommendedLimit || 0;
                      const risk = c.assessment?.riskScore || 50;

                      return (
                        <tr key={c.id}>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.industry}</td>
                          <td>
                            <span className={`badge ${
                              rating.startsWith('A') ? 'badge-success' : rating.startsWith('B') ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {rating} ({score})
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '60px', height: '6px', background: 'var(--secondary)', borderRadius: '10px' }}>
                                <div style={{
                                  width: `${risk}%`,
                                  height: '100%',
                                  background: risk > 60 ? 'var(--danger)' : risk > 30 ? 'var(--warning)' : 'var(--success)',
                                  borderRadius: '10px'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.8rem' }}>{risk}%</span>
                            </div>
                          </td>
                          <td><strong>₹{limit.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <button 
                              onClick={() => router.push(`/dashboard/portfolio?id=${c.id}`)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column Right: Live alerts, KYC indicators, audit stream */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Smart Alerts */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
              Active System Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {highRiskCompanies.map((c) => (
                <div key={c.id} style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--danger-border)',
                  background: 'var(--danger-bg)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <ShieldAlert size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>High Risk: {c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                      Flagged due to rating {c.assessment?.creditRating} and {c.litigationsCount} active lawsuit(s).
                    </div>
                  </div>
                </div>
              ))}
              
              {highRiskCompanies.length === 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--success)' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>All counterparties clear. No active alerts.</span>
                </div>
              )}
            </div>
          </div>

          {/* KYC Audit Log */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} style={{ color: 'var(--primary)' }} />
              Audit Log Feed
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.auditLogs?.slice(0, 4).map((log: any) => (
                <div key={log.id} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    marginTop: '6px'
                  }} />
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{log.action}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{log.details}</div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secure details card */}
          {ownCompany && (
            <div className="card glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
                <Globe2 size={16} />
                Corporate Metadata
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>CIN:</span>
                  <strong>{ownCompany.cin || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>GSTIN:</span>
                  <strong>{ownCompany.gstin || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>PAN:</span>
                  <strong>{ownCompany.pan || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Industry:</span>
                  <strong>{ownCompany.industry}</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
