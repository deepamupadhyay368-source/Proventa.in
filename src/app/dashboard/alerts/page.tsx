'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AlertCustomer {
  id: string;
  name: string;
  riskScore: number;
  riskTier: string;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  customer: AlertCustomer | null;
}

interface AlertRule {
  id: string;
  name: string;
  triggerType: string;
  threshold: number;
  severity: string;
  isActive: boolean;
  createdAt: string;
}

interface AlertStats {
  total: number;
  critical: number;
  unread: number;
  resolved: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSeverityConfig(severity: string) {
  const map: Record<string, { label: string; bg: string; color: string; border: string; icon: string }> = {
    CRITICAL: { label: 'Critical', bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '🔴' },
    HIGH:     { label: 'High',     bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', icon: '🟠' },
    MEDIUM:   { label: 'Medium',   bg: '#fffbeb', color: '#854d0e', border: '#fde68a', icon: '🟡' },
    LOW:      { label: 'Low',      bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', icon: '🔵' },
  };
  return map[severity] || map.LOW;
}

function getTypeIcon(type: string): string {
  const map: Record<string, string> = {
    SCORE_DROP:    '📉',
    OVERDUE:       '⏰',
    GST_LAPSE:     '🪖',
    LITIGATION:    '⚖️',
    LIMIT_BREACH:  '💳',
    PAYMENT_LATE:  '💸',
  };
  return map[type] || '⚠️';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)', fontSize: 14, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400,
    }}>
      <span>{type === 'success' ? '✓' : '✗'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alert, onMarkRead, onResolve, onDelete }: {
  alert: Alert;
  onMarkRead: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sev = getSeverityConfig(alert.severity);
  return (
    <div style={{
      background: alert.isRead ? '#fff' : sev.bg,
      border: `1px solid ${alert.isRead ? '#f1f5f9' : sev.border}`,
      borderRadius: 14, padding: '18px 20px', marginBottom: 12,
      borderLeft: `4px solid ${sev.color}`,
      transition: 'all 0.2s',
      position: 'relative',
    }}>
      {!alert.isRead && (
        <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: sev.color }} />
      )}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{getTypeIcon(alert.type)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
              {sev.icon} {sev.label}
            </span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#f1f5f9', color: '#6b7280' }}>{alert.type.replace('_', ' ')}</span>
            {alert.customer && (
              <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 500 }}>→ {alert.customer.name}</span>
            )}
          </div>
          <div style={{ fontWeight: 600, color: '#0B1F3A', fontSize: 14, marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{alert.title}</div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>{alert.message}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(alert.createdAt)}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {!alert.isRead && (
                <button onClick={() => onMarkRead(alert.id)} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>
                  Mark Read
                </button>
              )}
              {!alert.isResolved && (
                <button onClick={() => onResolve(alert.id)} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #bbf7d0', borderRadius: 6, background: '#f0fdf4', color: '#166534', cursor: 'pointer', fontWeight: 600 }}>
                  ✓ Resolve
                </button>
              )}
              <button onClick={() => onDelete(alert.id)} style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Rule Form ─────────────────────────────────────────────────────────────
function AddRuleForm({ onSuccess }: { onSuccess: (rule: AlertRule) => void }) {
  const [form, setForm] = useState({ name: '', triggerType: 'SCORE_DROP', threshold: '', severity: 'HIGH' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerDescriptions: Record<string, string> = {
    SCORE_DROP:       'Alert when a customer\'s risk score falls below this value (e.g. 500)',
    OVERDUE_DAYS:     'Alert when an invoice is overdue by more than this many days (e.g. 30)',
    LIMIT_BREACH_PCT: 'Alert when credit utilization exceeds this percentage (e.g. 80)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/alerts?createRule=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, threshold: parseFloat(form.threshold) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create rule'); return; }
      onSuccess(data.rule);
      setForm({ name: '', triggerType: 'SCORE_DROP', threshold: '', severity: 'HIGH' });
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ padding: '24px 28px', marginBottom: 24, background: 'linear-gradient(135deg, #f8fafc, #fff)' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Create New Alert Rule</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Automated rules that continuously evaluate your customer portfolio and generate alerts when thresholds are breached.</p>

      {/* Trigger descriptions */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
        💡 {triggerDescriptions[form.triggerType]}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="dashboard-grid" style={{ gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label className="form-label">Rule Name *</label>
              <input className="form-input" placeholder="e.g. High Risk Score Alert" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label className="form-label">Trigger Type *</label>
              <select className="form-input" value={form.triggerType} onChange={e => setForm(p => ({ ...p, triggerType: e.target.value }))}>
                <option value="SCORE_DROP">Score Drop</option>
                <option value="OVERDUE_DAYS">Overdue Days</option>
                <option value="LIMIT_BREACH_PCT">Credit Limit Breach %</option>
              </select>
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label className="form-label">
                Threshold *
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>
                  ({form.triggerType === 'SCORE_DROP' ? 'score < X' : form.triggerType === 'OVERDUE_DAYS' ? 'days > X' : 'usage > X%'})
                </span>
              </label>
              <input className="form-input" type="number" placeholder={form.triggerType === 'SCORE_DROP' ? '500' : form.triggerType === 'OVERDUE_DAYS' ? '30' : '80'} value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} required />
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label className="form-label">Alert Severity</label>
              <select className="form-input" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
            {loading ? 'Creating...' : '+ Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [bySeverity, setBySeverity] = useState<Record<string, number>>({});
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'rules' | 'resolved'>('active');
  const [evaluating, setEvaluating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchAlerts = useCallback(async () => {
    try {
      const [alertRes, ruleRes] = await Promise.all([
        fetch('/api/dashboard/alerts'),
        fetch('/api/dashboard/alerts?rules=true'),
      ]);
      const alertData = await alertRes.json();
      const ruleData = await ruleRes.json();
      if (alertRes.ok) {
        setAlerts(alertData.alerts || []);
        setBySeverity(alertData.bySeverity || {});
        setUnresolvedCount(alertData.unresolvedCount || 0);
        setUnreadCount(alertData.unreadCount || 0);
      }
      if (ruleRes.ok) setRules(ruleData.rules || []);
    } catch {
      setToast({ message: 'Failed to load alerts', type: 'error' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/dashboard/alerts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isRead: true }) });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { setToast({ message: 'Failed to update alert', type: 'error' }); }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch('/api/dashboard/alerts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isRead: true, isResolved: true }) });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true, isResolved: true, resolvedAt: new Date().toISOString() } : a));
      setUnresolvedCount(prev => Math.max(0, prev - 1));
      setToast({ message: 'Alert resolved successfully', type: 'success' });
    } catch { setToast({ message: 'Failed to resolve alert', type: 'error' }); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/alerts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
        setToast({ message: 'Alert deleted', type: 'success' });
      }
    } catch { setToast({ message: 'Failed to delete alert', type: 'error' }); }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Delete this alert rule?')) return;
    try {
      const res = await fetch(`/api/dashboard/alerts?ruleId=${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        setToast({ message: 'Alert rule deleted', type: 'success' });
      }
    } catch { setToast({ message: 'Failed to delete rule', type: 'error' }); }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/dashboard/alerts?runEvaluation=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message, type: 'success' });
        fetchAlerts(); // Refresh after evaluation
      } else {
        setToast({ message: data.error || 'Evaluation failed', type: 'error' });
      }
    } catch { setToast({ message: 'Evaluation failed', type: 'error' }); }
    finally { setEvaluating(false); }
  };

  const activeAlerts = alerts.filter(a => !a.isResolved);
  const resolvedAlerts = alerts.filter(a => a.isResolved);

  const filteredActive = activeAlerts.filter(a => severityFilter === 'ALL' || a.severity === severityFilter)
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
    });

  const stats: AlertStats = {
    total: alerts.length,
    critical: bySeverity.CRITICAL || 0,
    unread: unreadCount,
    resolved: resolvedAlerts.length,
  };

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .tab-btn { border: none; background: none; cursor: pointer; padding: 10px 20px; font-size: 14px; font-weight: 500; color: #6b7280; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #2563EB; border-bottom-color: #2563EB; }
        .tab-btn:hover { color: #374151; }
        .rule-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Credit Alert Center
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            Real-time credit monitoring — auto-refreshes every 30 seconds
            <span style={{ marginLeft: 8, display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite', verticalAlign: 'middle' }} />
          </p>
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={evaluating}
          style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid #2563EB',
            background: evaluating ? '#f1f5f9' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            color: evaluating ? '#9ca3af' : '#fff', cursor: evaluating ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {evaluating ? (
            <>
              <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #ccc', borderTopColor: '#2563EB', borderRadius: '50%', display: 'inline-block' }} />
              Evaluating Rules...
            </>
          ) : '⚡ Run Rule Evaluation'}
        </button>
      </div>

      {/* Stats Header Row */}
      <div className="dashboard-grid" style={{ marginBottom: 24, gap: 16 }}>
        <div className="col-4" style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Total Alerts</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>{stats.total}</div>
        </div>
        <div className="col-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff)', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Critical</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#EF4444', fontFamily: 'Outfit, sans-serif' }}>{stats.critical}</div>
        </div>
        <div className="col-4" style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Unread</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#F59E0B', fontFamily: 'Outfit, sans-serif' }}>{stats.unread}</span>
            {stats.unread > 0 && <span className="badge badge-warning">Needs Review</span>}
          </div>
        </div>
        <div className="col-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #fff)', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Resolved</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: 24, display: 'flex', gap: 4 }}>
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          Active Alerts
          {unresolvedCount > 0 && (
            <span style={{ marginLeft: 8, background: '#EF4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{unresolvedCount}</span>
          )}
        </button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
          Alert Rules
          <span style={{ marginLeft: 8, background: '#f1f5f9', color: '#6b7280', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{rules.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>
          Resolved
          <span style={{ marginLeft: 8, background: '#dcfce7', color: '#166534', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{stats.resolved}</span>
        </button>
      </div>

      {/* ── ACTIVE ALERTS TAB ─────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div>
          {/* Severity Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
              const cfg = sev === 'ALL' ? null : getSeverityConfig(sev);
              const count = sev === 'ALL' ? filteredActive.length : (bySeverity[sev] || 0);
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  style={{
                    padding: '6px 14px', border: severityFilter === sev
                      ? `2px solid ${cfg ? cfg.color : '#374151'}`
                      : '1px solid #e2e8f0',
                    borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: severityFilter === sev ? (cfg ? cfg.bg : '#f8fafc') : '#fff',
                    color: severityFilter === sev ? (cfg ? cfg.color : '#374151') : '#6b7280',
                    transition: 'all 0.2s',
                  }}
                >
                  {sev === 'ALL' ? 'All' : getSeverityConfig(sev).icon + ' ' + sev.charAt(0) + sev.slice(1).toLowerCase()}
                  <span style={{ marginLeft: 6, fontWeight: 700 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
              <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 12px' }} />
              Loading alerts...
            </div>
          ) : filteredActive.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ margin: '0 0 8px', color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                {severityFilter !== 'ALL' ? `No ${severityFilter.toLowerCase()} alerts` : 'All clear!'}
              </h3>
              <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: 14 }}>
                {severityFilter !== 'ALL' ? 'No alerts at this severity level.' : 'No active alerts. Run a rule evaluation to check your portfolio.'}
              </p>
              {severityFilter === 'ALL' && (
                <button onClick={handleRunEvaluation} className="btn btn-primary" disabled={evaluating}>
                  ⚡ Run Evaluation
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredActive.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkRead={handleMarkRead}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ALERT RULES TAB ───────────────────────────────────────────────── */}
      {activeTab === 'rules' && (
        <div>
          <AddRuleForm
            onSuccess={(rule) => {
              setRules(prev => [rule, ...prev]);
              setToast({ message: `Alert rule "${rule.name}" created`, type: 'success' });
            }}
          />

          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            Active Rules ({rules.length})
          </h3>

          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⚙️</div>
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>No alert rules configured yet. Create your first rule above.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    {['Rule Name', 'Trigger Type', 'Threshold', 'Severity', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => {
                    const sev = getSeverityConfig(rule.severity);
                    const triggerLabel: Record<string, string> = {
                      SCORE_DROP: 'Score Drop',
                      OVERDUE_DAYS: 'Overdue Days',
                      LIMIT_BREACH_PCT: 'Limit Breach %',
                    };
                    return (
                      <tr key={rule.id} className="rule-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0B1F3A' }}>{rule.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 11, color: '#374151', fontWeight: 500 }}>
                            {triggerLabel[rule.triggerType] || rule.triggerType}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                          {rule.threshold}
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 3 }}>
                            {rule.triggerType === 'OVERDUE_DAYS' ? 'days' : rule.triggerType === 'LIMIT_BREACH_PCT' ? '%' : 'pts'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {sev.icon} {rule.severity}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: rule.isActive ? '#dcfce7' : '#f3f4f6', color: rule.isActive ? '#166534' : '#9ca3af' }}>
                            {rule.isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 12 }}>
                          {new Date(rule.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => handleDeleteRule(rule.id)} style={{ padding: '4px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}>
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── RESOLVED ALERTS TAB ───────────────────────────────────────────── */}
      {activeTab === 'resolved' && (
        <div>
          {resolvedAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <h3 style={{ margin: '0 0 8px', color: '#374151', fontFamily: 'Outfit, sans-serif' }}>No resolved alerts yet</h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>Alerts you resolve will appear here for your records.</p>
            </div>
          ) : (
            <div>
              {resolvedAlerts.map(alert => {
                const sev = getSeverityConfig(alert.severity);
                return (
                  <div key={alert.id} style={{
                    background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '16px 20px',
                    marginBottom: 10, borderLeft: '4px solid #10B981', opacity: 0.85,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 14 }}>{getTypeIcon(alert.type)}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: sev.bg, color: sev.color }}>{alert.severity}</span>
                          {alert.customer && <span style={{ fontSize: 12, color: '#6b7280' }}>→ {alert.customer.name}</span>}
                        </div>
                        <div style={{ fontWeight: 600, color: '#374151', fontSize: 14, marginBottom: 2 }}>{alert.title}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>{alert.message}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>✓ Resolved</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </div>
                        <button onClick={() => handleDelete(alert.id)} style={{ marginTop: 8, padding: '3px 8px', border: '1px solid #f1f5f9', borderRadius: 5, background: '#fff', color: '#9ca3af', cursor: 'pointer', fontSize: 11 }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
