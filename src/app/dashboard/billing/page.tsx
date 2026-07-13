'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  Crown,
  CheckCircle,
  Download,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const PLAN_LIMITS = {
  FREE: { assessments: 5, customers: 10, invoices: 20 },
  PRO: { assessments: 50, customers: 100, invoices: 500 },
  ENTERPRISE: { assessments: -1, customers: -1, invoices: -1 },
};

function UsageMeter({ label, current, max, icon }: { label: string; current: number; max: number; icon: React.ReactNode }) {
  const unlimited = max === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
          {icon}
          {label}
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--foreground)' }}>
          {unlimited ? `${current} / ∞` : `${current} / ${max}`}
        </span>
      </div>
      {!unlimited && (
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
        </div>
      )}
    </div>
  );
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free Trial',
    price: '₹0',
    period: '/month',
    description: 'Explore core credit intelligence features',
    badge: null,
    features: [
      '5 credit assessments / month',
      '10 customer profiles',
      '20 invoice records',
      '2 team members',
      'Basic risk scoring',
      'Dashboard analytics',
      'Email support',
    ],
    cta: 'Current Plan',
    disabled: true,
    accent: '#6b7280',
  },
  {
    id: 'PRO',
    name: 'Growth',
    price: '₹2,999',
    period: '/month',
    description: 'Full-scale credit intelligence for growing SMEs',
    badge: 'Most Popular',
    features: [
      '50 assessments / month',
      '100 customer profiles',
      '500 invoice records',
      '10 team members',
      'AI financial forecasting',
      'Industry benchmarking',
      'CSV & PDF exports',
      'GST & MCA integrations',
      'Priority support',
    ],
    cta: 'Upgrade to Growth',
    disabled: false,
    accent: '#2563EB',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Unlimited power for financial institutions',
    badge: 'Full Power',
    features: [
      'Unlimited assessments',
      'Unlimited customers & invoices',
      'Unlimited team members',
      'White-label branding',
      'Custom AI agent studio',
      'Dedicated account manager',
      'SLA: 99.9% uptime',
      'On-premise deployment option',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    disabled: false,
    accent: '#7C3AED',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return '#10B981';
    case 'TRIAL': return '#2563EB';
    case 'CANCELLED': return '#EF4444';
    case 'PAST_DUE': return '#F59E0B';
    default: return '#6b7280';
  }
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  async function fetchBilling() {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/billing');
      if (!res.ok) throw new Error('Failed to load billing data');
      const data = await res.json();
      setBillingData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: string) {
    setActionLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Upgrade failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleActivateTrial() {
    setActionLoading('trial');
    setError(null);
    try {
      const res = await fetch('/api/dashboard/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_trial' }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchBilling();
      } else {
        throw new Error(data.error || 'Trial activation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) return;
    setActionLoading('cancel');
    try {
      const res = await fetch('/api/dashboard/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Your subscription has been cancelled.');
        fetchBilling();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  const plan = billingData?.plan || 'FREE';
  const status = billingData?.status || 'ACTIVE';
  const usage = billingData?.usage || { assessments: 0, customers: 0, invoices: 0 };
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.FREE;
  const records = billingData?.records || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
          Billing & Subscription
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
          Manage your plan, usage limits, and payment history.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: '10px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16,185,129,0.08)', border: '1px solid #10B981', borderRadius: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* ── Current Plan Card ────────────────────────────────────────────────── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #1e3a5f 100%)', color: '#fff', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '80px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(37,99,235,0.15)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Crown size={22} color="#F59E0B" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {plan === 'FREE' ? 'Free' : plan === 'PRO' ? 'Growth' : 'Enterprise'} Plan
              </h2>
              <span style={{ padding: '0.2rem 0.75rem', borderRadius: '999px', background: getStatusColor(status), color: '#fff', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {status}
              </span>
            </div>

            {billingData?.trialDaysRemaining !== null && status === 'TRIAL' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(245,158,11,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', width: 'fit-content' }}>
                <Clock size={15} color="#F59E0B" />
                <span style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 600 }}>
                  {billingData.trialDaysRemaining} days remaining in your trial
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <UsageMeter
                label="Credit Assessments"
                current={usage.assessments}
                max={limits.assessments}
                icon={<Sparkles size={14} />}
              />
              <UsageMeter
                label="Customer Profiles"
                current={usage.customers}
                max={limits.customers}
                icon={<Users size={14} />}
              />
              <UsageMeter
                label="Invoice Records"
                current={usage.invoices}
                max={limits.invoices}
                icon={<FileText size={14} />}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
            {status !== 'TRIAL' && plan === 'FREE' && (
              <button
                onClick={handleActivateTrial}
                disabled={actionLoading === 'trial'}
                style={{ padding: '0.65rem 1.5rem', background: '#F59E0B', color: '#0B1F3A', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {actionLoading === 'trial' ? 'Activating...' : <><Zap size={15} /> Start 14-Day Trial</>}
              </button>
            )}
            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={actionLoading === 'PRO' || plan === 'PRO' || plan === 'ENTERPRISE'}
              style={{ padding: '0.65rem 1.5rem', background: plan === 'PRO' || plan === 'ENTERPRISE' ? 'rgba(255,255,255,0.1)' : '#2563EB', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontWeight: 700, cursor: plan === 'PRO' || plan === 'ENTERPRISE' ? 'default' : 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {actionLoading === 'PRO' ? 'Processing...' : <><ArrowUpRight size={15} /> Upgrade Plan</>}
            </button>
            {(status === 'ACTIVE' || status === 'TRIAL') && (
              <button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Plan Comparison Cards ────────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
          Compare Plans
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {PLANS.map((p) => {
            const isCurrent = plan === p.id;
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: '1.75rem',
                  border: isCurrent ? `2px solid ${p.accent}` : '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {p.badge && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: p.accent, color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {p.badge}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: p.accent, color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Current
                  </div>
                )}

                <div style={{ marginTop: isCurrent || p.badge ? '1.75rem' : '0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: p.accent }}>{p.price}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.period}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 1.25rem 0' }}>{p.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--foreground)' }}>
                        <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (p.id === 'FREE') return;
                      if (p.id === 'ENTERPRISE') {
                        window.location.href = '/book-demo';
                        return;
                      }
                      handleUpgrade(p.id);
                    }}
                    disabled={isCurrent || actionLoading === p.id}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: isCurrent ? 'var(--border)' : p.accent,
                      color: isCurrent ? 'var(--muted)' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {actionLoading === p.id ? 'Processing...' : isCurrent ? 'Current Plan' : p.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing History Table ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
            Billing History
          </h2>
          <TrendingUp size={18} color="var(--muted)" />
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
            <CreditCard size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No billing records yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Date', 'Description', 'Amount', 'Status', 'Receipt'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--foreground)', fontWeight: 500 }}>
                      {r.description}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--foreground)', fontWeight: 700 }}>
                      {r.amount === 0 ? '—' : `₹${(r.amount / 100).toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge badge-${r.status === 'PAID' ? 'success' : r.status === 'REFUNDED' ? 'warning' : 'danger'}`} style={{ fontSize: '0.72rem' }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 600 }}
                        onClick={() => alert('Receipt download coming soon')}
                      >
                        <Download size={13} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment Methods ──────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', margin: '0 0 1rem 0' }}>
          Payment Method
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--background)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={22} color="var(--muted)" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>No card on file</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--muted)' }}>Add a payment method to enable auto-renewal</div>
            </div>
          </div>
          <button
            onClick={() => handleUpgrade('PRO')}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
