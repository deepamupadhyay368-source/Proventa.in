'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  issueDate: string;
  agingBucket: string;
  daysOverdue: number;
}

interface Alert {
  id: string;
  severity: string;
  title: string;
  isResolved: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
  industry: string | null;
  annualRevenue: number | null;
  creditLimit: number;
  usedCredit: number;
  riskScore: number;
  riskTier: string;
  payOnTimeCount: number;
  payLateCount: number;
  avgDso: number;
  notes: string | null;
  status: string;
  createdAt: string;
  invoices: Invoice[];
  alerts: Alert[];
}

interface Summary {
  totalCustomers: number;
  avgRiskScore: number;
  totalCreditExposed: number;
  overdueCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  'Manufacturing', 'Retail & Trade', 'IT & Software', 'Construction',
  'Healthcare & Pharma', 'Logistics & Transport', 'Food & Beverage',
  'Financial Services', 'Real Estate', 'Education', 'Agriculture', 'Other',
];

function fmt(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function getRiskColor(score: number): string {
  if (score >= 700) return '#10B981';
  if (score >= 500) return '#F59E0B';
  return '#EF4444';
}

function getTierBadgeClass(tier: string): string {
  if (['AAA', 'AA', 'A'].includes(tier)) return 'badge badge-success';
  if (['BBB', 'BB'].includes(tier)) return 'badge badge-info';
  if (tier === 'B') return 'badge badge-warning';
  return 'badge badge-danger';
}

function getStatusBadgeClass(status: string): string {
  if (status === 'ACTIVE') return 'badge badge-success';
  if (status === 'WATCHLIST') return 'badge badge-warning';
  return 'badge badge-danger';
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)', fontSize: 14, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380,
      animation: 'fadeIn 0.3s ease',
    }}>
      <span>{type === 'success' ? '✓' : '✗'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div style={{ padding: '0 0 24px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 52, background: 'linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)',
          backgroundSize: '200% 100%', borderRadius: 8, marginBottom: 8,
          animation: 'shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}

// ─── Add Customer Modal ───────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (c: Customer) => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gstin: '', pan: '',
    industry: '', annualRevenue: '', creditLimit: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ score: number; tier: string } | null>(null);

  // Live risk preview
  useEffect(() => {
    let score = 600;
    if (form.annualRevenue) {
      const rev = parseFloat(form.annualRevenue);
      if (rev >= 100_000_000) score += 150;
      else if (rev >= 50_000_000) score += 100;
      else if (rev >= 10_000_000) score += 60;
      else if (rev >= 1_000_000) score += 30;
      else score += 10;
    }
    if (!form.gstin.trim()) score -= 50;
    if (!form.pan.trim()) score -= 30;
    score = Math.max(300, Math.min(900, score));
    let tier = 'D';
    if (score >= 850) tier = 'AAA';
    else if (score >= 800) tier = 'AA';
    else if (score >= 750) tier = 'A';
    else if (score >= 700) tier = 'BBB';
    else if (score >= 650) tier = 'BB';
    else if (score >= 550) tier = 'B';
    else if (score >= 450) tier = 'C';
    setPreview({ score, tier });
  }, [form.annualRevenue, form.gstin, form.pan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          annualRevenue: form.annualRevenue ? parseFloat(form.annualRevenue) : null,
          creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create customer'); return; }
      onSuccess(data.customer);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(11,31,58,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 36,
        width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(11,31,58,0.25)',
        border: '1px solid rgba(37,99,235,0.12)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>Add New Customer</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Risk score is computed automatically</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
        </div>

        {/* Live Risk Preview */}
        {preview && (
          <div style={{
            background: `linear-gradient(135deg, ${getRiskColor(preview.score)}18, ${getRiskColor(preview.score)}08)`,
            border: `1px solid ${getRiskColor(preview.score)}40`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: getRiskColor(preview.score), fontFamily: 'Outfit, sans-serif' }}>{preview.score}</div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Risk Score</div>
            </div>
            <div style={{ width: 1, height: 40, background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: getRiskColor(preview.score), fontFamily: 'Outfit, sans-serif' }}>{preview.tier}</div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Credit Tier</div>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: '#6b7280' }}>
              Score updates live as you fill in GSTIN, PAN, and Annual Revenue.
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="dashboard-grid" style={{ gap: 14 }}>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" placeholder="Acme Industries Ltd." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="finance@acme.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-input" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">GSTIN</label>
                <input className="form-input" placeholder="27AAPFU0939F1ZV" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} style={{ fontFamily: 'monospace' }} />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">PAN</label>
                <input className="form-input" placeholder="AAPFU0939F" value={form.pan} onChange={e => setForm(p => ({ ...p, pan: e.target.value }))} style={{ fontFamily: 'monospace' }} />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Annual Revenue (₹)</label>
                <input className="form-input" type="number" placeholder="50000000" value={form.annualRevenue} onChange={e => setForm(p => ({ ...p, annualRevenue: e.target.value }))} />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Credit Limit (₹)</label>
                <input className="form-input" type="number" placeholder="2500000" value={form.creditLimit} onChange={e => setForm(p => ({ ...p, creditLimit: e.target.value }))} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} placeholder="Any additional notes about this customer..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                  Creating...
                </span>
              ) : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Customer Detail Panel ─────────────────────────────────────────────────────
function CustomerDetailPanel({ customer, onClose, onEdit, onDelete }: {
  customer: Customer;
  onClose: () => void;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
}) {
  const utilPct = customer.creditLimit > 0 ? Math.min(100, (customer.usedCredit / customer.creditLimit) * 100) : 0;
  const totalPayments = customer.payOnTimeCount + customer.payLateCount;
  const onTimePct = totalPayments > 0 ? Math.round((customer.payOnTimeCount / totalPayments) * 100) : 100;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 900,
      width: '100%', maxWidth: 480,
      background: '#fff',
      boxShadow: '-8px 0 40px rgba(11,31,58,0.15)',
      overflowY: 'auto',
      animation: 'slideInRight 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0B1F3A, #1e3a5f)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className={getTierBadgeClass(customer.riskTier)}>{customer.riskTier}</span>
              <span className={getStatusBadgeClass(customer.status)}>{customer.status}</span>
            </div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 20, fontFamily: 'Outfit, sans-serif' }}>{customer.name}</h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{customer.industry || 'Industry not specified'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#fff' }}>×</button>
        </div>

        {/* Risk Score Gauge */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Risk Score</span>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{customer.riskScore} / 900</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(customer.riskScore / 900) * 100}%`,
              background: `linear-gradient(90deg, ${getRiskColor(customer.riskScore)}, ${getRiskColor(customer.riskScore)}cc)`,
              borderRadius: 4, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Credit Utilization */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Credit Utilization</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#374151' }}>Used: {fmt(customer.usedCredit)}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: utilPct > 80 ? '#EF4444' : utilPct > 60 ? '#F59E0B' : '#10B981' }}>{utilPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              height: '100%', width: `${utilPct}%`,
              background: utilPct > 80 ? 'linear-gradient(90deg, #EF4444, #dc2626)' : utilPct > 60 ? 'linear-gradient(90deg, #F59E0B, #d97706)' : 'linear-gradient(90deg, #10B981, #059669)',
              borderRadius: 5, transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
            <span>₹0</span>
            <span>Limit: {fmt(customer.creditLimit)}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact Details</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customer.email && <div style={{ display: 'flex', gap: 12, fontSize: 13 }}><span style={{ color: '#9ca3af', width: 60 }}>Email</span><span style={{ color: '#374151' }}>{customer.email}</span></div>}
            {customer.phone && <div style={{ display: 'flex', gap: 12, fontSize: 13 }}><span style={{ color: '#9ca3af', width: 60 }}>Phone</span><span style={{ color: '#374151' }}>{customer.phone}</span></div>}
            {customer.gstin && <div style={{ display: 'flex', gap: 12, fontSize: 13 }}><span style={{ color: '#9ca3af', width: 60 }}>GSTIN</span><span style={{ color: '#374151', fontFamily: 'monospace' }}>{customer.gstin}</span></div>}
            {customer.pan && <div style={{ display: 'flex', gap: 12, fontSize: 13 }}><span style={{ color: '#9ca3af', width: 60 }}>PAN</span><span style={{ color: '#374151', fontFamily: 'monospace' }}>{customer.pan}</span></div>}
            {customer.annualRevenue && <div style={{ display: 'flex', gap: 12, fontSize: 13 }}><span style={{ color: '#9ca3af', width: 60 }}>Revenue</span><span style={{ color: '#374151' }}>{fmt(customer.annualRevenue)}</span></div>}
          </div>
        </div>

        {/* Payment Behavior */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Behavior</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>{onTimePct}%</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>On Time</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#374151', fontFamily: 'Outfit, sans-serif' }}>{customer.payOnTimeCount}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>On-time Pays</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: customer.payLateCount > 0 ? '#EF4444' : '#9ca3af', fontFamily: 'Outfit, sans-serif' }}>{customer.payLateCount}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Late Pays</div>
            </div>
          </div>
        </div>

        {/* Active Invoices */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Recent Invoices ({customer.invoices.length})
          </h4>
          {customer.invoices.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No invoices yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customer.invoices.slice(0, 5).map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>#{inv.invoiceNumber}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Due: {new Date(inv.dueDate).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(inv.totalAmount)}</div>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: inv.status === 'PAID' ? '#d1fae5' : inv.status === 'OVERDUE' ? '#fee2e2' : '#dbeafe', color: inv.status === 'PAID' ? '#065f46' : inv.status === 'OVERDUE' ? '#991b1b' : '#1e40af' }}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        {customer.alerts.length > 0 && (
          <div style={{ padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontWeight: 600, color: '#92400e', fontSize: 14 }}>{customer.alerts.length} Active Alert{customer.alerts.length > 1 ? 's' : ''}</span>
            </div>
            {customer.alerts.map(a => (
              <div key={a.id} style={{ fontSize: 12, color: '#78350f', marginBottom: 4 }}>• {a.title}</div>
            ))}
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</h4>
            <p style={{ margin: 0, color: '#374151', fontSize: 13, lineHeight: 1.6 }}>{customer.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(customer)}>✏️ Edit</button>
          <button onClick={() => onDelete(customer.id)} style={{ flex: 1, padding: '10px 16px', border: '1px solid #fecaca', borderRadius: 10, background: '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalCustomers: 0, avgRiskScore: 0, totalCreditExposed: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/customers');
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
        setSummary(data.summary);
      }
    } catch {
      setToast({ message: 'Failed to load customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete the customer and all their invoices and alerts.')) return;
    try {
      const res = await fetch(`/api/dashboard/customers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
      setCustomers(prev => prev.filter(c => c.id !== id));
      setSelectedCustomer(null);
      setToast({ message: data.message, type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase() || '').includes(search.toLowerCase());
    const matchTier = tierFilter === 'ALL' || c.riskTier === tierFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchTier && matchStatus;
  });

  const highRiskCount = customers.filter(c => c.riskScore < 500).length;

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .customer-row:hover { background: #f8fafc !important; }
        .action-btn { opacity: 0; transition: opacity 0.2s; }
        .customer-row:hover .action-btn { opacity: 1; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Customer Risk Intelligence
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            Monitor credit risk, payment behavior, and exposure across your customer portfolio
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={fetchCustomers} style={{
            padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10,
            background: '#fff', cursor: 'pointer', fontSize: 16, color: '#6b7280',
            transition: 'all 0.2s',
          }} title="Refresh">↻</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: 8, display: 'flex', alignItems: 'center' }}>
            <span>+</span> Add Customer
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="dashboard-grid" style={{ marginBottom: 24, gap: 16 }}>
        <div className="col-4" style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Customers</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{summary.totalCustomers}</div>
            </div>
            <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👥</div>
          </div>
        </div>

        <div className="col-4" style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Avg Risk Score</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: getRiskColor(summary.avgRiskScore), fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{summary.avgRiskScore}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Portfolio average</div>
            </div>
            <div style={{ width: 44, height: 44, background: `${getRiskColor(summary.avgRiskScore)}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📊</div>
          </div>
        </div>

        <div className="col-4" style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Credit Exposed</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{fmt(summary.totalCreditExposed)}</div>
            </div>
            <div style={{ width: 44, height: 44, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
          </div>
        </div>

        <div className="col-4" style={{
          background: highRiskCount > 0 ? 'linear-gradient(135deg, #fef2f2, #fff)' : '#fff',
          borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(11,31,58,0.06)',
          border: highRiskCount > 0 ? '1px solid #fecaca' : '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>High Risk Customers</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: highRiskCount > 0 ? '#EF4444' : '#9ca3af', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{highRiskCount}</span>
                {highRiskCount > 0 && <span className="badge badge-danger">Action Needed</span>}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{summary.overdueCount} customers with overdue invoices</div>
            </div>
            <div style={{ width: 44, height: 44, background: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠️</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        boxShadow: '0 2px 12px rgba(11,31,58,0.05)', border: '1px solid #f1f5f9',
        display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, margin: 0 }}
          />
        </div>
        <div>
          <select className="form-input" value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ margin: 0, minWidth: 140 }}>
            <option value="ALL">All Tiers</option>
            {['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C', 'D'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ margin: 0, minWidth: 140 }}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="WATCHLIST">Watchlist</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>
          {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Customer Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        {loading ? (
          <div style={{ padding: 24 }}><SkeletonTable /></div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <h3 style={{ margin: '0 0 8px', color: '#374151', fontFamily: 'Outfit, sans-serif' }}>No customers found</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
              {search || tierFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your filters.'
                : 'Add your first customer to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Customer', 'Risk Score', 'Tier', 'Credit Limit', 'Utilization', 'Outstanding AR', 'Payment Behavior', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => {
                  const utilPct = c.creditLimit > 0 ? Math.min(100, (c.usedCredit / c.creditLimit) * 100) : 0;
                  const totalPays = c.payOnTimeCount + c.payLateCount;
                  const onTimePct = totalPays > 0 ? Math.round((c.payOnTimeCount / totalPays) * 100) : 100;
                  const outstandingAR = c.invoices
                    .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
                    .reduce((s, inv) => s + (inv.totalAmount - inv.paidAmount), 0);

                  return (
                    <tr
                      key={c.id}
                      className="customer-row"
                      style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 2 }}>{c.name}</div>
                        <div style={{ color: '#9ca3af', fontSize: 11 }}>{c.email || c.industry || '—'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 64, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${(c.riskScore / 900) * 100}%`,
                              background: getRiskColor(c.riskScore),
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, color: getRiskColor(c.riskScore), fontFamily: 'Outfit, sans-serif' }}>{c.riskScore}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span className={getTierBadgeClass(c.riskTier)}>{c.riskTier}</span></td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#374151' }}>{fmt(c.creditLimit)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${utilPct}%`,
                              background: utilPct > 80 ? '#EF4444' : utilPct > 60 ? '#F59E0B' : '#10B981',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontSize: 12, color: utilPct > 80 ? '#dc2626' : '#6b7280' }}>{utilPct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: outstandingAR > 0 ? '#374151' : '#9ca3af' }}>{fmt(outstandingAR)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: '#10B981', fontWeight: 600 }}>{onTimePct}% on-time</span>
                          {c.payLateCount > 0 && <span style={{ color: '#EF4444', marginLeft: 6 }}>{c.payLateCount} late</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span className={getStatusBadgeClass(c.status)}>{c.status}</span></td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <button className="btn btn-sm action-btn" onClick={() => setSelectedCustomer(c)} style={{ padding: '4px 10px' }}>View</button>
                          <button className="action-btn" onClick={() => handleDelete(c.id)} style={{
                            padding: '4px 8px', border: '1px solid #fecaca', borderRadius: 6,
                            background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 12,
                          }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals & Panels */}
      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onSuccess={(c) => {
            setCustomers(prev => [c, ...prev]);
            setShowAdd(false);
            setToast({ message: `Customer "${c.name}" created with risk score ${c.riskScore}`, type: 'success' });
            fetchCustomers();
          }}
        />
      )}

      {selectedCustomer && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 899, background: 'rgba(11,31,58,0.2)' }} onClick={() => setSelectedCustomer(null)} />
          <CustomerDetailPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onEdit={() => {/* TODO: Edit modal */}}
            onDelete={handleDelete}
          />
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
