'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Shield, Globe, Award, CheckCircle } from 'lucide-react';

export default function PlatformSettingsPage() {
  const router = useRouter();
  const [activePlan, setActivePlan] = useState('FREE');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Security states
  const [ipAllowlist, setIpAllowlist] = useState('127.0.0.1; 192.168.1.1');
  const [lockoutAttempts, setLockoutAttempts] = useState('5');
  const [sessionTimeout, setSessionTimeout] = useState('60');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setActivePlan(data.user.organization?.planType || 'FREE');
          setLoading(false);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handlePlanUpgrade = async (plan: string) => {
    if (plan === activePlan) return;
    setUpdating(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/settings/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActivePlan(plan);
      setSuccessMsg(`Licensing upgraded to ${plan} successfully.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(`Upgrade failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Security Architecture: IP Allowlisting, Session timeouts, and Account lockout covenents updated.');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  const invoices = [
    { id: 'INV-10928', date: '2026-07-01', amount: activePlan === 'FREE' ? '$0.00' : activePlan === 'PRO' ? '$499.00' : '$2,499.00', status: 'PAID' },
    { id: 'INV-10815', date: '2026-06-01', amount: '$0.00', status: 'PAID' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>Platform Settings & Subscription</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Configure trade volume thresholds, IP firewalls, and billing contracts</p>
      </div>

      {successMsg && (
        <div className="badge badge-success" style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Subscription cards comparison */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} style={{ color: 'var(--primary)' }} />
          Licensing & Subscription Billing
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          {/* Free Tier */}
          <div style={{
            padding: '1.5rem',
            border: activePlan === 'FREE' ? '2px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: activePlan === 'FREE' ? 'rgba(var(--primary-rgb), 0.02)' : 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative'
          }}>
            {activePlan === 'FREE' && (
              <span className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem' }}>Active Plan</span>
            )}
            <div>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'Outfit' }}>Developer Free</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>$0 <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--muted)' }}>/ month</span></div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1 }}>
              Ideal for sandbox testing. Access credit reports for up to 5 companies, mock scoring, and basic API endpoints.
            </p>
            <button 
              onClick={() => handlePlanUpgrade('FREE')} 
              disabled={activePlan === 'FREE' || updating} 
              className={`btn btn-sm ${activePlan === 'FREE' ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%' }}
            >
              Downgrade to Free
            </button>
          </div>

          {/* Pro Tier */}
          <div style={{
            padding: '1.5rem',
            border: activePlan === 'PRO' ? '2px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: activePlan === 'PRO' ? 'rgba(var(--primary-rgb), 0.02)' : 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative'
          }}>
            {activePlan === 'PRO' && (
              <span className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem' }}>Active Plan</span>
            )}
            <div>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'Outfit' }}>Enterprise Pro</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>$499 <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--muted)' }}>/ month</span></div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1 }}>
              For growing SMEs. Access credit reports for up to 100 counterparties, active litigation filters, and unlimited custom API keys.
            </p>
            <button 
              onClick={() => handlePlanUpgrade('PRO')} 
              disabled={activePlan === 'PRO' || updating} 
              className={`btn btn-sm ${activePlan === 'PRO' ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%' }}
            >
              {activePlan === 'FREE' ? 'Upgrade to Pro' : 'Downgrade to Pro'}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div style={{
            padding: '1.5rem',
            border: activePlan === 'ENTERPRISE' ? '2px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: activePlan === 'ENTERPRISE' ? 'rgba(var(--primary-rgb), 0.02)' : 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative'
          }}>
            {activePlan === 'ENTERPRISE' && (
              <span className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem' }}>Active Plan</span>
            )}
            <div>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'Outfit' }}>Unlimited Scale</strong>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>$2,499 <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--muted)' }}>/ month</span></div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1 }}>
              For banks and NBFC credit boards. Unlimited counterparties, deep insolvency search feeds, customized SLA support, and dedicated AI model hosting.
            </p>
            <button 
              onClick={() => handlePlanUpgrade('ENTERPRISE')} 
              disabled={activePlan === 'ENTERPRISE' || updating} 
              className={`btn btn-sm ${activePlan === 'ENTERPRISE' ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%' }}
            >
              Upgrade to Unlimited
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Security configurations */}
        <div className="card col-6">
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--danger)' }} />
            Enterprise Security Policies (RBAC)
          </h3>

          <form onSubmit={handleSecuritySave}>
            <div className="form-group">
              <label className="form-label">Authorized IP Range Whitelist</label>
              <input 
                type="text" 
                className="form-input" 
                value={ipAllowlist} 
                onChange={(e) => setIpAllowlist(e.target.value)} 
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--muted)' }}>Semi-colon separated. Restricts API keys and dashboard access.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Account Lockout Policy</label>
                <select className="form-input" value={lockoutAttempts} onChange={(e) => setLockoutAttempts(e.target.value)}>
                  <option value="3">3 Fail attempts</option>
                  <option value="5">5 Fail attempts</option>
                  <option value="10">10 Fail attempts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Session Timeout</label>
                <select className="form-input" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">120 Minutes</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
              Save Security Policies
            </button>
          </form>
        </div>

        {/* Right Side: Invoices history list */}
        <div className="card col-6">
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: 'var(--success)' }} />
            Receipts & Invoices History
          </h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Billing Date</th>
                  <th>Amount</th>
                  <th>SLA Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong>{inv.id}</strong></td>
                    <td>{inv.date}</td>
                    <td>{inv.amount}</td>
                    <td>
                      <span className="badge badge-success">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
