'use client';
import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingProgress {
  profileDone: boolean;
  gstLinked: boolean;
  bankLinked: boolean;
  firstAssessment: boolean;
  teamInvited: boolean;
  dismissed: boolean;
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS: {
  key: keyof Omit<OnboardingProgress, 'dismissed'>;
  label: string;
  description: string;
  href: string;
}[] = [
  {
    key: 'profileDone',
    label: 'Complete Company Profile',
    description: 'Add your business details, address, and contact info',
    href: '/dashboard/settings/company',
  },
  {
    key: 'gstLinked',
    label: 'Link GSTIN / PAN',
    description: 'Verify your GST and PAN for credit eligibility',
    href: '/dashboard/settings/kyb',
  },
  {
    key: 'bankLinked',
    label: 'Add Bank Statement',
    description: 'Upload 6 months of statements for cash flow analysis',
    href: '/dashboard/documents',
  },
  {
    key: 'firstAssessment',
    label: 'Run First Assessment',
    description: 'Generate your initial credit score and risk report',
    href: '/dashboard/assessments/new',
  },
  {
    key: 'teamInvited',
    label: 'Invite Team Member',
    description: 'Collaborate with your finance team on the platform',
    href: '/dashboard/team',
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="#ecfdf5" stroke="#10B981" strokeWidth="1.5" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#d1d5db" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingChecklist() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [visible, setVisible] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/onboarding/progress');
      if (!res.ok) throw new Error('Failed to load onboarding progress');
      const data = await res.json();
      setProgress(data);
      if (data.dismissed) setVisible(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleDismiss = async () => {
    try {
      setDismissing(true);
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismiss: true }),
      });
      setVisible(false);
    } catch (err) {
      console.error('Failed to dismiss onboarding:', err);
    } finally {
      setDismissing(false);
    }
  };

  if (!visible) return null;
  if (loading) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563EB',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading onboarding progress…</span>
      </div>
    );
  }

  if (error || !progress) return null;

  const completedCount = STEPS.filter(s => progress[s.key]).length;
  const totalSteps = STEPS.length;
  const percentage = Math.round((completedCount / totalSteps) * 100);
  const allDone = completedCount === totalSteps;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: '#ffffff',
        border: '1px solid',
        borderColor: allDone ? '#a7f3d0' : '#bfdbfe',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(11,31,58,0.06)',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          background: allDone
            ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
            : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          cursor: 'pointer',
          userSelect: 'none',
          gap: '1rem',
        }}
        onClick={() => setCollapsed(prev => !prev)}
      >
        {/* Left: title + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
          {/* Progress circle */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: allDone ? '#10B981' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#ffffff',
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: '0.8rem',
            }}
          >
            {percentage}%
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#111827', fontFamily: "'Manrope', sans-serif", fontSize: '0.95rem' }}>
              {allDone ? '🎉 Setup Complete!' : 'Get Started with Proventa'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
              {completedCount} of {totalSteps} steps completed
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Progress bar (mini) */}
          <div style={{ width: '80px', height: '6px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden', display: 'block' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: allDone ? '#10B981' : '#2563EB', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>

          <button
            onClick={e => { e.stopPropagation(); setCollapsed(prev => !prev); }}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <ChevronIcon open={!collapsed} />
          </button>

          <button
            onClick={e => { e.stopPropagation(); handleDismiss(); }}
            disabled={dismissing}
            title="Dismiss checklist"
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', opacity: dismissing ? 0.5 : 1 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6b7280')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <div style={{ padding: '0.5rem 0' }}>
          {STEPS.map((step, idx) => {
            const done = progress[step.key];
            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 1.5rem',
                  borderBottom: idx < STEPS.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background 0.15s ease',
                  cursor: done ? 'default' : 'pointer',
                }}
                onMouseEnter={e => {
                  if (!done) (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
                onClick={() => {
                  if (!done) window.location.href = step.href;
                }}
              >
                {/* Checkbox icon */}
                <div style={{ flexShrink: 0 }}>
                  <CheckIcon done={done} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: done ? '#6b7280' : '#111827',
                      textDecoration: done ? 'line-through' : 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {step.label}
                  </div>
                  {!done && (
                    <div style={{ fontSize: '0.775rem', color: '#9ca3af', marginTop: '2px' }}>
                      {step.description}
                    </div>
                  )}
                </div>

                {/* Arrow for incomplete steps */}
                {!done && (
                  <a
                    href={step.href}
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      textDecoration: 'none',
                      flexShrink: 0,
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#dbeafe';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#eff6ff';
                    }}
                  >
                    Start <ArrowRightIcon />
                  </a>
                )}

                {done && (
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, flexShrink: 0 }}>Done</span>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ padding: '0.875rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {allDone
                ? 'All steps complete — you\'re ready to use Proventa!'
                : `${totalSteps - completedCount} step${totalSteps - completedCount !== 1 ? 's' : ''} remaining`}
            </span>
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.375rem 0.875rem',
                fontSize: '0.775rem',
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
              }}
            >
              {dismissing ? 'Dismissing…' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
