import React, { Component, ErrorInfo, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function AlertOctagonIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshCwIcon() {
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
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

// ─── ErrorBoundary Class Component ───────────────────────────────────────────

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to console in development; swap for a real error reporter (Sentry, etc.) in prod
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught an error:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Allow consumers to supply their own fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.12), 0 4px 16px rgba(0,0,0,0.06)',
              padding: '3rem',
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              animation: 'errorFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
              border: '1px solid #fee2e2',
            }}
          >
            {/* Gradient icon container */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.75rem auto',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(239, 68, 68, 0.35)',
              }}
            >
              <AlertOctagonIcon />
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: '1.6rem',
                color: '#111827',
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Something went wrong
            </h2>

            {/* Subtitle */}
            <p
              style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              An unexpected error occurred in the application. Our team has been notified and is investigating the issue.
            </p>

            {/* Error message box */}
            {error?.message && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '0.875rem 1.125rem',
                  marginBottom: '2rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#EF4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.375rem',
                  }}
                >
                  Error Details
                </div>
                <code
                  style={{
                    fontSize: '0.82rem',
                    color: '#b91c1c',
                    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}
                >
                  {error.message}
                </code>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.875rem 1.75rem',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.35)';
                }}
              >
                <RefreshCwIcon />
                Retry
              </button>

              <button
                onClick={() => (window.location.href = '/dashboard')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.875rem 1.75rem',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Go to Dashboard
              </button>
            </div>

            {/* Footer note */}
            <p
              style={{
                marginTop: '2rem',
                fontSize: '0.78rem',
                color: '#9ca3af',
              }}
            >
              If this issue persists, contact{' '}
              <a
                href="mailto:support@proventa.ai"
                style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
              >
                support@proventa.ai
              </a>
            </p>
          </div>

          {/* Inline keyframes */}
          <style>{`
            @keyframes errorFadeIn {
              from { opacity: 0; transform: scale(0.96) translateY(12px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
