'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart, Activity, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('behavior');

  const tabs = [
    { id: 'behavior', label: 'Payment Behavior', icon: <Activity size={16} /> },
    { id: 'risk', label: 'Risk Distribution', icon: <PieChart size={16} /> },
    { id: 'cohorts', label: 'Revenue Cohorts', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Advanced Analytics</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Deep dive into portfolio performance and risk metrics.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--primary)' : 'var(--muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'behavior' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Payment Status Overview</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
              <svg viewBox="0 0 100 100" style={{ height: '100%', width: '100%', maxWidth: '250px' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="15" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--success)" strokeWidth="15" strokeDasharray="188.4 251.2" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--warning)" strokeWidth="15" strokeDasharray="37.6 251.2" strokeDashoffset="-188.4" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--danger)" strokeWidth="15" strokeDasharray="25.2 251.2" strokeDashoffset="-226" transform="rotate(-90 50 50)" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--success)' }}>● On Time (75%)</span>
              <span style={{ color: 'var(--warning)' }}>● 1-30 Days Late (15%)</span>
              <span style={{ color: 'var(--danger)' }}>● 30+ Days Late (10%)</span>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Collection Trend</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '250px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              {[60, 65, 55, 75, 80, 85].map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '100%', height: `${val}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Score Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '250px', borderBottom: '1px solid var(--border)' }}>
              {[10, 15, 30, 45, 60, 40, 20, 10, 5].map((val, i) => (
                <div key={i} style={{ flex: 1, height: `${val}%`, background: i > 5 ? 'var(--success)' : i > 2 ? 'var(--warning)' : 'var(--danger)', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--muted)' }}>
              <span>300</span>
              <span>600</span>
              <span>900</span>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>High Risk Exposure</h3>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ paddingBottom: '0.5rem' }}>Customer</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Score</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Exposure</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '0.75rem 0' }}>Acme Corp</td><td style={{ color: 'var(--danger)', fontWeight: 700 }}>420</td><td>₹4.5L</td></tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: '0.75rem 0' }}>Globex Inc</td><td style={{ color: 'var(--danger)', fontWeight: 700 }}>450</td><td>₹2.1L</td></tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: '0.75rem 0' }}>Soylent Ltd</td><td style={{ color: 'var(--warning)', fontWeight: 700 }}>510</td><td>₹8.0L</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="card" style={{ padding: '2rem' }}>
           <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Retention & Repeat Business</h3>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--muted)' }}>
             Advanced cohort visualization requires D3.js or similar library integration.
           </div>
        </div>
      )}
    </div>
  );
}
