'use client';

import React, { useState } from 'react';
import { Download, FileText, Users, AlertTriangle, Activity, Lock } from 'lucide-react';

export default function ExportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/dashboard/exports?type=${type}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition');
      let filename = `proventa-${type}.json`;
      if (cd && cd.includes('filename=')) {
        filename = cd.split('filename=')[1].replace(/"/g, '');
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Export failed. Make sure the API exists.');
    }
    setLoading(null);
  };

  const cards = [
    { id: 'portfolio', title: 'Portfolio Data Dump', desc: 'Complete JSON export of all company profiles and assessments.', format: 'JSON', icon: <Activity size={24} color="var(--primary)" /> },
    { id: 'customers', title: 'Customer Risk Summary', desc: 'Credit limits, scores, and outstanding balances of all counterparties.', format: 'JSON', icon: <Users size={24} color="var(--secondary)" /> },
    { id: 'invoices', title: 'AR & Invoices Report', desc: 'Detailed invoice ledger with aging buckets and payment status.', format: 'JSON', icon: <FileText size={24} color="var(--success)" /> },
    { id: 'alerts', title: 'Alert History Log', desc: 'Historical record of all credit and risk alerts generated.', format: 'JSON', icon: <AlertTriangle size={24} color="var(--warning)" /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Export Center</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Securely download your data for offline analysis or compliance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {cards.map(c => (
          <div key={c.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '12px' }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{c.title}</h3>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c.format} format</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{c.desc}</p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => handleExport(c.id)}
              disabled={loading === c.id}
            >
              {loading === c.id ? <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Download size={16} />}
              {loading === c.id ? 'Generating...' : 'Export Data'}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--background)' }}>
        <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
          <Lock size={32} style={{ color: 'var(--muted)' }} />
        </div>
        <div>
          <h3 style={{ fontWeight: 700 }}>Data Portability Guarantee</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.5rem', maxWidth: '600px' }}>
            In compliance with the DPDP Act and GDPR, you have the right to export your data at any time. All exports are generated in real-time and do not contain sensitive PII unless explicitly required.
          </p>
        </div>
      </div>
    </div>
  );
}
