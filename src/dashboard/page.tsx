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
  History
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

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>Executive Intelligence Overview</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Real-time Credit scoring, defaults analysis, and legal exposure indexes</p>
        </div>
        <button onClick={() => router.push('/onboarding')} className="btn btn-primary btn-sm">
          <Building size={16} />
          Edit Onboarding Details
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="dashboard-grid">
        {/* Card 1: Own Credit Score */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(37,99,235,0.08)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Your Credit Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {ownCompany?.assessment?.creditScore || '750'}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 700 }}>
                ({ownCompany?.assessment?.creditRating || 'AA'})
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Exposure Limit */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(16,185,129,0.08)',
            color: 'var(--success)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Trade Credit Exposure</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              ${metrics.totalExposure.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 3: Portfolio average Credit Score */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(6,182,212,0.08)',
            color: 'var(--info)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Portfolio Avg Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {metrics.averageCreditScore}/900
            </div>
          </div>
        </div>

        {/* Card 4: Litigation and Gearing Risk warnings */}
        <div className="card col-3" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(239,68,68,0.08)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Active Court Disputes</div>
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
          
          {/* Credit Rating Bar Distribution chart */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.5rem' }}>Trade Portfolio Credit Rating Spread</h3>
            <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem' }}>
              {ratingDistribution.map((count, index) => {
                const heightPercentage = (count / maxCount) * 80 + 10; // offset minimal height
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
          </div>

          {/* Table: Full Counterparty scoring */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700 }}>Corporate Credit Portfolio</h3>
            
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
                              <div style={{ width: '60px', height: '6px', background: 'var(--secondary)', borderRadius: 'var(--radius-full)' }}>
                                <div style={{
                                  width: `${risk}%`,
                                  height: '100%',
                                  background: risk > 60 ? 'var(--danger)' : risk > 30 ? 'var(--warning)' : 'var(--success)',
                                  borderRadius: 'var(--radius-full)'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.8rem' }}>{risk}%</span>
                            </div>
                          </td>
                          <td><strong>${limit.toLocaleString()}</strong></td>
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
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} style={{ color: 'var(--primary)' }} />
              Audit log Feed
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
