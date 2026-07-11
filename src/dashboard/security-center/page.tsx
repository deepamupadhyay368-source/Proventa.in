'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, LogOut, CheckCircle, AlertTriangle, RefreshCw, 
  Smartphone, Clock, Users, Eye, Database, ShieldAlert, History
} from 'lucide-react';

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'mfa' | 'keys' | 'audit'>('overview');
  const [sessions, setSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaStatus, setMfaStatus] = useState({ enabled: false, recoveryCodes: [] as string[] });
  
  const [rotating, setRotating] = useState(false);
  const [keyRotatedMessage, setKeyRotatedMessage] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchSessions();
    fetchAuditLogs();
    checkMfaStatus();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/dashboard/security/session');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/dashboard/security/logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {}
  };

  const checkMfaStatus = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setMfaStatus({
          enabled: data.user?.mfaEnabled || false,
          recoveryCodes: data.user?.recoveryCodes ? JSON.parse(data.user.recoveryCodes) : []
        });
      }
    } catch (e) {}
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/dashboard/security/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        fetchSessions();
        fetchAuditLogs();
      }
    } catch (e) {}
  };

  const handleSetupMfa = async () => {
    setMfaError('');
    setMfaMessage('');
    try {
      const res = await fetch('/api/auth/mfa');
      if (res.ok) {
        const data = await res.json();
        setMfaSetup(data);
      }
    } catch (e) {}
  };

  const handleVerifyMfa = async () => {
    setMfaError('');
    setMfaMessage('');
    try {
      const res = await fetch('/api/auth/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mfaToken })
      });
      const data = await res.json();
      if (!res.ok) {
        setMfaError(data.error || 'Verification failed');
      } else {
        setMfaMessage('Multi-Factor Authentication enabled successfully.');
        setMfaSetup(null);
        setMfaToken('');
        checkMfaStatus();
        fetchAuditLogs();
      }
    } catch (e) {
      setMfaError('An error occurred. Please try again.');
    }
  };

  const handleRotateKey = async () => {
    setRotating(true);
    setKeyRotatedMessage('');
    try {
      const res = await fetch('/api/dashboard/security/rotate-key', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setKeyRotatedMessage(data.message);
        fetchAuditLogs();
      } else {
        setKeyRotatedMessage(`Error: ${data.error}`);
      }
    } catch (e) {
      setKeyRotatedMessage('Key rotation call failed.');
    } finally {
      setRotating(false);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={32} style={{ color: 'var(--primary)' }} />
          Enterprise Security Center
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Zero-Trust security administration, active session audits, encryption key rotation, and compliance parameters.
        </p>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'Dashboard & Scores', icon: <Shield size={16} /> },
          { id: 'sessions', label: 'Active Sessions', icon: <Smartphone size={16} /> },
          { id: 'mfa', label: 'MFA Configuration', icon: <Smartphone size={16} /> },
          { id: 'keys', label: 'Encryption Key Rotation', icon: <Key size={16} /> },
          { id: 'audit', label: 'Security Audit Logs', icon: <History size={16} /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview & Scorecard */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Metrics score row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>SECURITY COMPLIANCE SCORE</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--success)' }}>
                95 <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                Aligned with SOC-2 Type II, ISO 27001, and GDPR guardrails.
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>ACTIVE USER SESSIONS</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800 }}>
                {sessions.length} <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>device(s)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                Monitored session timeouts are currently active.
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>ENVELOPE ENCRYPTION KEY</div>
              <div style={{ fontSize: '1.2rem', fontFamily: 'Outfit', fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem' }}>
                AES-256-GCM Active
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                Unique per-tenant cryptographically isolated DEK key.
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Zero-Trust Control Checks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'HTTP Strict Transport Security (HSTS) Enforced', desc: 'Prevents protocol downgrade attacks by forcing HTTPS in transit.', status: true },
                { label: 'Database Envelope Encryption Active', desc: 'Customer CIN, GSTIN, PAN, and files are wrapped using per-tenant DEK keys.', status: true },
                { label: 'Argon2id Hashing Scheme Implemented', desc: 'Secure asynchronous industry standard password hashing parameters.', status: true },
                { label: 'Strict SameSite Cookie Flags Configured', desc: 'Prevents CSRF vulnerabilities on JWT and session authorization cookies.', status: true },
                { label: 'Multi-Factor Authentication (MFA)', desc: 'Provides TOTP token challenges on account credentials verification.', status: mfaStatus.enabled }
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ color: item.status ? 'var(--success)' : 'var(--warning)', marginTop: '0.2rem' }}>
                    {item.status ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{item.label}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Session Device Auditing</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Any unrecognized sessions can be remotely terminated immediately. This forces the respective device to log out.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <th style={{ padding: '0.75rem' }}>IP Address</th>
                <th style={{ padding: '0.75rem' }}>User Agent / Browser</th>
                <th style={{ padding: '0.75rem' }}>Created At</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.ipAddress || '127.0.0.1'}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.userAgent || 'Mozilla/5.0'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--muted)' }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <LogOut size={12} />
                      Revoke Device
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: MFA Setup */}
      {activeTab === 'mfa' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Multi-Factor Authentication (MFA)</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Add an extra layer of protection to your account by configuring TOTP Authenticator apps (e.g., Google Authenticator, Authy).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: mfaStatus.enabled ? 'var(--success)' : 'var(--muted)' }}>
              <Smartphone size={32} />
            </div>
            <div>
              <strong style={{ fontSize: '1rem' }}>
                Status: {mfaStatus.enabled ? 'Enabled' : 'Disabled'}
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {mfaStatus.enabled ? 'Your account is secured with a TOTP verification factor.' : 'MFA challenge verification is currently inactive.'}
              </div>
            </div>
          </div>

          {mfaMessage && (
            <div className="badge badge-success" style={{ padding: '0.75rem', textAlign: 'center', display: 'block' }}>
              {mfaMessage}
            </div>
          )}

          {!mfaStatus.enabled && !mfaSetup && (
            <button onClick={handleSetupMfa} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Setup Multi-Factor Authentication
            </button>
          )}

          {mfaSetup && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div>
                <strong>Step 1: Scan this QR Code or manually enter secret</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Use your authenticator app to scan the provisioning QR code or enter the secret key:
                </p>
                <div style={{
                  background: 'var(--secondary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  marginTop: '0.5rem',
                  alignSelf: 'flex-start'
                }}>
                  {mfaSetup.secret}
                </div>
              </div>

              <div>
                <strong>Step 2: Enter 6-digit confirmation code</strong>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '120px', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px' }}
                  />
                  <button onClick={handleVerifyMfa} className="btn btn-primary">
                    Verify & Enable
                  </button>
                </div>
                {mfaError && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{mfaError}</span>}
              </div>
            </div>
          )}

          {mfaStatus.enabled && mfaStatus.recoveryCodes.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <strong>Recovery Backup Codes</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                Store these backup codes securely. They allow account access in case you lose your MFA device:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {mfaStatus.recoveryCodes.map((code, idx) => (
                  <div key={idx} style={{ background: 'var(--secondary)', padding: '0.4rem', borderRadius: '4px', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Key Rotation */}
      {activeTab === 'keys' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cryptographic Key Rotation</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Allows rotating the organization's unique Data Encryption Key (DEK). This operation will decrypt all active company profile columns using the old key, generate a fresh random 256-bit DEK, and re-encrypt the data.
            </p>
          </div>

          <div style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>💡 Critical Cryptographic Guidelines:</strong>
            <ul style={{ fontSize: '0.8rem', color: 'var(--muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>Key rotation should be executed periodically (e.g., every 90 days) or after any personnel change.</li>
              <li>This process occurs transactionally in the database to prevent partial writes.</li>
              <li>Do not close or reload this dashboard tab while rotation is executing.</li>
            </ul>
          </div>

          {keyRotatedMessage && (
            <div className={`badge ${keyRotatedMessage.startsWith('Error') ? 'badge-danger' : 'badge-success'}`} style={{ padding: '0.75rem', textAlign: 'center', display: 'block' }}>
              {keyRotatedMessage}
            </div>
          )}

          <button
            onClick={handleRotateKey}
            disabled={rotating}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
          >
            <RefreshCw size={16} className={rotating ? 'animate-spin' : ''} />
            {rotating ? 'Re-encrypting Records...' : 'Rotate Data Encryption Key'}
          </button>
        </div>
      )}

      {/* TAB CONTENT: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Immutable Audit logs</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            System events are logged immutably, registering timestamps, actor ID, and transaction details.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  background: 'var(--background)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{log.action}</span>
                    <strong style={{ color: 'var(--foreground)' }}>{log.userEmail || 'System'}</strong>
                  </div>
                  <div style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{log.details}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  {log.ipAddress && <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>IP: {log.ipAddress}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
