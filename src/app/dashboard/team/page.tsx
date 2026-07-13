'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SkeletonTable } from '@/components/Skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER' | 'AUDITOR' | 'INACTIVE';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

interface TeamData {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
}

// ─── Role Config ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<UserRole, { bg: string; color: string; border: string }> = {
  ADMIN:    { bg: 'rgba(11,31,58,0.08)',   color: '#0B1F3A', border: 'rgba(11,31,58,0.2)' },
  ANALYST:  { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB', border: 'rgba(37,99,235,0.2)' },
  VIEWER:   { bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.2)' },
  AUDITOR:  { bg: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: 'rgba(139,92,246,0.2)' },
  INACTIVE: { bg: 'rgba(107,114,128,0.08)',color: '#6b7280', border: 'rgba(107,114,128,0.2)' },
};

// ─── Permission Matrix ────────────────────────────────────────────────────────

type Permission = 'View Data' | 'Edit Records' | 'Admin Settings' | 'Export Data' | 'Invite Members' | 'Run Assessments';

const PERMISSION_MATRIX: Record<UserRole, Record<Permission, boolean>> = {
  ADMIN:    { 'View Data': true,  'Edit Records': true,  'Admin Settings': true,  'Export Data': true,  'Invite Members': true,  'Run Assessments': true  },
  ANALYST:  { 'View Data': true,  'Edit Records': true,  'Admin Settings': false, 'Export Data': true,  'Invite Members': false, 'Run Assessments': true  },
  VIEWER:   { 'View Data': true,  'Edit Records': false, 'Admin Settings': false, 'Export Data': false, 'Invite Members': false, 'Run Assessments': false },
  AUDITOR:  { 'View Data': true,  'Edit Records': false, 'Admin Settings': false, 'Export Data': true,  'Invite Members': false, 'Run Assessments': false },
  INACTIVE: { 'View Data': false, 'Edit Records': false, 'Admin Settings': false, 'Export Data': false, 'Invite Members': false, 'Run Assessments': false },
};

const PERMISSION_KEYS: Permission[] = [
  'View Data',
  'Edit Records',
  'Admin Settings',
  'Export Data',
  'Invite Members',
  'Run Assessments',
];

const INVITABLE_ROLES: UserRole[] = ['ADMIN', 'ANALYST', 'VIEWER', 'AUDITOR'];

// ─── Icons ────────────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_COLORS[role] ?? ROLE_COLORS.INACTIVE;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ role }: { role: UserRole }) {
  const isActive = role !== 'INACTIVE';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: isActive ? 'rgba(16,185,129,0.08)' : 'rgba(107,114,128,0.08)',
        color: isActive ? '#10B981' : '#6b7280',
        border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)'}`,
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#9ca3af', display: 'inline-block' }} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Inline spinner ───────────────────────────────────────────────────────────

function Spinner({ size = 16, color = '#2563EB' }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`@keyframes team-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${Math.max(2, size / 8)}px solid rgba(0,0,0,0.1)`,
          borderTopColor: color,
          animation: 'team-spin 0.75s linear infinite',
          flexShrink: 0,
        }}
      />
    </>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

interface InviteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address');

    try {
      setSending(true);
      const res = await fetch('/api/dashboard/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role, message: message.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send invite');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 31, 58, 0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'modal-fade 0.2s ease both',
      }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <style>{`
        @keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-slide { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 30px 80px rgba(11,31,58,0.25)',
          animation: 'modal-slide 0.25s cubic-bezier(0.16,1,0.3,1) both',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0B1F3A, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <MailIcon />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#111827', letterSpacing: '-0.02em' }}>
                Invite Team Member
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>Send an email invitation with a secure join link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.375rem', cursor: 'pointer', color: '#6b7280', display: 'flex' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="invite-email">Email Address</label>
            <input
              ref={emailRef}
              id="invite-email"
              type="email"
              className="form-input"
              placeholder="colleague@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="invite-role">Role</label>
            <select
              id="invite-role"
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
            >
              {INVITABLE_ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Role description */}
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.8rem',
              color: '#6b7280',
              lineHeight: 1.5,
            }}>
              {{
                ADMIN:   '🔑 Full access — can manage team, settings, and all data',
                ANALYST: '📊 Can run assessments, edit records, and export data',
                VIEWER:  '👁 Read-only access to all reports and dashboards',
                AUDITOR: '📋 Can view and export data but cannot make changes',
              }[role]}
            </div>
          </div>

          {/* Optional message */}
          <div className="form-group">
            <label className="form-label" htmlFor="invite-message">
              Personal Message <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              id="invite-message"
              className="form-input"
              placeholder="Add a personal note to your invitation…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#374151',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              style={{
                flex: 2,
                padding: '0.875rem',
                background: sending ? '#93c5fd' : '#0B1F3A',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#ffffff',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {sending ? <Spinner size={16} color="#fff" /> : <SendIcon />}
              {sending ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // track which action is in-flight
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/team');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      const teamData: TeamData = await res.json();
      setData(teamData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeactivate = async (userId: string, userName: string) => {
    if (!confirm(`Deactivate ${userName ?? 'this user'}? They will lose access immediately.`)) return;
    try {
      setActionLoading(userId);
      const res = await fetch(`/api/dashboard/team?userId=${userId}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error ?? 'Failed to deactivate user');
      showFeedback(`${userName ?? 'User'} has been deactivated`);
      fetchTeam();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to deactivate user', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Cancel invite for ${email}?`)) return;
    try {
      setActionLoading(inviteId);
      const res = await fetch(`/api/dashboard/team?inviteId=${inviteId}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error ?? 'Failed to cancel invite');
      showFeedback('Invite cancelled');
      fetchTeam();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to cancel invite', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvite = async (inviteId: string, email: string, role: UserRole) => {
    try {
      setActionLoading(`resend_${inviteId}`);
      // Cancel old invite then send a new one
      await fetch(`/api/dashboard/team?inviteId=${inviteId}`, { method: 'DELETE' });
      const res = await fetch('/api/dashboard/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error ?? 'Failed to resend invite');
      showFeedback(`Invite resent to ${email}`);
      fetchTeam();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to resend invite', true);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const daysUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const avatarColors = ['#0B1F3A', '#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  const getAvatarColor = (str: string) => avatarColors[str.charCodeAt(0) % avatarColors.length];

  return (
    <div className="dashboard-main" style={{ padding: '2.5rem' }}>
      {/* ── Page Header ── */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0B1F3A, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}>
            <UsersIcon />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Team & Access Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Manage your team members, roles, and access permissions
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
        >
          <PlusIcon />
          Invite Member
        </button>
      </div>

      {/* ── Feedback banners ── */}
      {successMessage && (
        <div style={{
          padding: '0.875rem 1.25rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          color: '#065f46',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckIcon /> {successMessage}
        </div>
      )}
      {actionError && (
        <div style={{
          padding: '0.875rem 1.25rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          color: '#b91c1c',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          ⚠ {actionError}
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SkeletonTable rows={5} columns={5} />
          <SkeletonTable rows={3} columns={4} />
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div style={{
          padding: '2rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          textAlign: 'center',
          color: '#b91c1c',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Failed to load team data</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-sm btn-primary" onClick={fetchTeam}>Retry</button>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Section 1: Active Members ── */}
          <section className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
                  Active Members
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                  {data.members.filter(m => m.role !== 'INACTIVE').length} active of {data.members.length} total
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.members.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    data.members.map(member => (
                      <tr key={member.id}>
                        {/* Member */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: getAvatarColor(member.email),
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              flexShrink: 0,
                              fontFamily: "'Manrope', sans-serif",
                            }}>
                              {getInitials(member.name, member.email)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                {member.name ?? '—'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{member.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td><RoleBadge role={member.role} /></td>

                        {/* Status */}
                        <td><StatusBadge role={member.role} /></td>

                        {/* Joined */}
                        <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          {formatDate(member.createdAt)}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          {member.role !== 'INACTIVE' ? (
                            <button
                              onClick={() => handleDeactivate(member.id, member.name ?? member.email)}
                              disabled={actionLoading === member.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.875rem',
                                background: '#fef2f2',
                                color: '#EF4444',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                cursor: actionLoading === member.id ? 'not-allowed' : 'pointer',
                                opacity: actionLoading === member.id ? 0.6 : 1,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => { if (!actionLoading) (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                            >
                              {actionLoading === member.id ? <Spinner size={12} color="#EF4444" /> : null}
                              Deactivate
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.775rem', color: '#9ca3af', fontStyle: 'italic' }}>Deactivated</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Section 2: Pending Invites ── */}
          <section className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
                Pending Invitations
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                {data.pendingInvites.length} invite{data.pendingInvites.length !== 1 ? 's' : ''} awaiting acceptance
              </p>
            </div>

            {data.pendingInvites.length === 0 ? (
              <div style={{
                background: '#f8fafc',
                border: '1px dashed #d1d5db',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.875rem',
              }}>
                No pending invitations. Invite a team member to get started.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Expires</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingInvites.map(invite => {
                      const daysLeft = daysUntilExpiry(invite.expiresAt);
                      const isExpiring = daysLeft <= 2;
                      return (
                        <tr key={invite.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563EB',
                              }}>
                                <MailIcon />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                                {invite.email}
                              </span>
                            </div>
                          </td>
                          <td><RoleBadge role={invite.role} /></td>
                          <td>
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: isExpiring ? '#EF4444' : '#6b7280',
                            }}>
                              {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                              Sent {formatDate(invite.createdAt)}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleResendInvite(invite.id, invite.email, invite.role)}
                                disabled={!!actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  padding: '0.375rem 0.875rem',
                                  background: '#eff6ff',
                                  color: '#2563EB',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '8px',
                                  fontSize: '0.775rem',
                                  fontWeight: 700,
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  opacity: actionLoading === `resend_${invite.id}` ? 0.6 : 1,
                                }}
                              >
                                {actionLoading === `resend_${invite.id}` ? <Spinner size={12} color="#2563EB" /> : <RefreshIcon />}
                                Resend
                              </button>
                              <button
                                onClick={() => handleCancelInvite(invite.id, invite.email)}
                                disabled={!!actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  padding: '0.375rem 0.875rem',
                                  background: '#fef2f2',
                                  color: '#EF4444',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '8px',
                                  fontSize: '0.775rem',
                                  fontWeight: 700,
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  opacity: actionLoading === invite.id ? 0.6 : 1,
                                }}
                              >
                                {actionLoading === invite.id ? <Spinner size={12} color="#EF4444" /> : <TrashIcon />}
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Section 3: Role Permission Matrix ── */}
          <section className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                <ShieldIcon />
                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
                  Role Permissions Reference
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                A reference guide for what each role can and cannot do
              </p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {INVITABLE_ROLES.map(role => (
                      <th key={role} style={{ textAlign: 'center' }}>
                        <RoleBadge role={role} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_KEYS.map(permission => (
                    <tr key={permission}>
                      <td style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        {permission}
                      </td>
                      {INVITABLE_ROLES.map(role => {
                        const allowed = PERMISSION_MATRIX[role][permission];
                        return (
                          <td key={role} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              {allowed ? <CheckIcon /> : <DashIcon />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <CheckIcon /> Allowed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <DashIcon /> Not allowed
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchTeam();
            showFeedback('Invitation sent successfully!');
          }}
        />
      )}
    </div>
  );
}
