'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Toast Config ─────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { borderColor: string; iconColor: string; bgColor: string; Icon: React.FC }> = {
  success: {
    borderColor: '#10B981',
    iconColor: '#10B981',
    bgColor: '#ecfdf5',
    Icon: CheckCircleIcon,
  },
  error: {
    borderColor: '#EF4444',
    iconColor: '#EF4444',
    bgColor: '#fef2f2',
    Icon: XCircleIcon,
  },
  warning: {
    borderColor: '#F59E0B',
    iconColor: '#F59E0B',
    bgColor: '#fffbeb',
    Icon: AlertTriangleIcon,
  },
  info: {
    borderColor: '#2563EB',
    iconColor: '#2563EB',
    bgColor: '#eff6ff',
    Icon: InfoIcon,
  },
};

// ─── Individual Toast Item ────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = TOAST_CONFIG[toast.type];
  const { Icon } = config;
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRemove = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 280);
  }, [onRemove, toast.id]);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    const duration = toast.duration ?? 4000;
    timerRef.current = setTimeout(handleRemove, duration);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleRemove, toast.duration]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        background: '#ffffff',
        borderRadius: '12px',
        borderLeft: `4px solid ${config.borderColor}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        padding: '1rem 1.25rem',
        minWidth: '320px',
        maxWidth: '400px',
        position: 'relative',
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.96)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'all',
      }}
    >
      {/* Icon */}
      <div
        style={{
          color: config.iconColor,
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <Icon />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#111827',
            lineHeight: 1.4,
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: '0.82rem',
              color: '#6b7280',
              marginTop: '0.25rem',
              lineHeight: 1.5,
            }}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'color 0.2s ease',
          marginTop: '1px',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
      >
        <CloseIcon />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: config.borderColor,
            opacity: 0.4,
            animation: `toast-progress ${toast.duration ?? 4000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Toast Provider ───────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const newToast: Toast = { id, type, title, message, duration };
      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {/* Keyframe injection */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {children}

      {/* Toast Stack — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
