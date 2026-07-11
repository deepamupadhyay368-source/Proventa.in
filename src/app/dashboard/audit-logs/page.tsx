'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((json) => {
        setLogs(json.auditLogs || []);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.ipAddress || '').includes(searchQuery)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>System Activity Audit Logs</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Immutable cryptographic ledger recording authentication, calculations, and platform modifications</p>
      </div>

      {/* Security Banner */}
      <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        <ShieldCheck size={28} style={{ color: 'var(--success)' }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Immutable Logging Architecture</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
            System activity registers cannot be edited, deleted, or modified by any user or administrator. Alignment is strictly compliant with SOC 2 Trust Services Criteria.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            className="form-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', margin: 0 }}
          />
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Security Action</th>
                <th>Operation Details</th>
                <th>IP Origin</th>
                <th>Ledger Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    No audit records registered.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={14} style={{ color: 'var(--primary)' }} />
                        <strong>{log.action}</strong>
                      </div>
                    </td>
                    <td>{log.details}</td>
                    <td><code>{log.ipAddress || '127.0.0.1'}</code></td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
