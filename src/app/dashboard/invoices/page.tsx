'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceCustomer {
  id: string;
  name: string;
  riskScore: number;
  riskTier: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  agingBucket: string;
  daysOverdue: number;
  dueDate: string;
  issueDate: string;
  paidDate: string | null;
  notes: string | null;
  customer: InvoiceCustomer;
}

interface ARSummary {
  totalAR: number;
  overdueAR: number;
  paidThisMonth: number;
  agingBreakdown: { current: number; d30: number; d60: number; d90plus: number };
}

interface CustomerOption {
  id: string;
  name: string;
  riskTier: string;
  riskScore: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function getStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    DRAFT:    { background: '#f3f4f6', color: '#6b7280' },
    SENT:     { background: '#dbeafe', color: '#1e40af' },
    PARTIAL:  { background: '#fef9c3', color: '#854d0e' },
    PAID:     { background: '#dcfce7', color: '#166534' },
    OVERDUE:  { background: '#fee2e2', color: '#991b1b' },
    CANCELLED:{ background: '#f3f4f6', color: '#9ca3af' },
  };
  return map[status] || map.DRAFT;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)', fontSize: 14, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380,
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

// ─── New Invoice Modal ────────────────────────────────────────────────────────
function NewInvoiceModal({ customers, onClose, onSuccess }: {
  customers: CustomerOption[];
  onClose: () => void;
  onSuccess: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    customerId: '', invoiceNumber: '', description: '', amount: '',
    taxRate: '18', dueDate: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(form.amount) || 0;
  const taxAmount = parsedAmount * (parseFloat(form.taxRate) || 0) / 100;
  const totalAmount = parsedAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), taxRate: parseFloat(form.taxRate) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create invoice'); return; }
      onSuccess(data.invoice);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(11,31,58,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(11,31,58,0.25)', border: '1px solid rgba(37,99,235,0.12)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>New Invoice</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Create a new accounts receivable invoice</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
        </div>

        {/* Amount Preview */}
        {parsedAmount > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 24 }}>
            <div><div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Base</div><div style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>₹{parsedAmount.toLocaleString('en-IN')}</div></div>
            <div><div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>GST ({form.taxRate}%)</div><div style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>₹{taxAmount.toLocaleString('en-IN')}</div></div>
            <div><div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Total</div><div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', fontFamily: 'Outfit, sans-serif' }}>{fmt(totalAmount)}</div></div>
          </div>
        )}

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="dashboard-grid" style={{ gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-input" value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} required>
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.riskTier})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Invoice Number *</label>
                <input className="form-input" placeholder="INV-2026-001" value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} required />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-input" type="number" placeholder="500000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="0" />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <select className="form-input" value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))}>
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Services rendered for Q2 FY2026" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Payment terms, special instructions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? 'Creating...' : `Create Invoice ${totalAmount > 0 ? fmt(totalAmount) : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Mark Paid Modal ──────────────────────────────────────────────────────────
function MarkPaidModal({ invoice, onClose, onSuccess }: {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: (updated: Invoice) => void;
}) {
  const outstanding = invoice.totalAmount - invoice.paidAmount;
  const [paidAmount, setPaidAmount] = useState(outstanding.toString());
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPartial = parseFloat(paidAmount) < outstanding;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const newStatus = isPartial ? 'PARTIAL' : 'PAID';
      const res = await fetch('/api/dashboard/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, status: newStatus, paidAmount: parseFloat(paidAmount), paidDate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update invoice'); return; }
      onSuccess(data.invoice);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(11,31,58,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 25px 80px rgba(11,31,58,0.25)' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>Record Payment</h2>
        <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 13 }}>Invoice #{invoice.invoiceNumber} · {invoice.customer.name}</p>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Invoice Total</span>
            <span style={{ fontWeight: 600 }}>{fmt(invoice.totalAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Already Paid</span>
            <span style={{ fontWeight: 600, color: '#10B981' }}>{fmt(invoice.paidAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0B1F3A' }}>Outstanding</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{fmt(outstanding)}</span>
          </div>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount Received (₹) *</label>
            <input className="form-input" type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} max={outstanding} min="1" required />
            {isPartial && parseFloat(paidAmount) > 0 && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#F59E0B' }}>⚡ Partial payment — invoice will be marked as PARTIAL</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Payment Date *</label>
            <input className="form-input" type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : isPartial ? 'Mark Partial' : '✓ Mark Paid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<ARSummary>({ totalAR: 0, overdueAR: 0, paidThisMonth: 0, agingBreakdown: { current: 0, d30: 0, d60: 0, d90plus: 0 } });
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, custRes] = await Promise.all([
        fetch('/api/dashboard/invoices'),
        fetch('/api/dashboard/customers'),
      ]);
      const invData = await invRes.json();
      const custData = await custRes.json();
      if (invRes.ok) { setInvoices(invData.invoices || []); setSummary(invData.summary); }
      if (custRes.ok) setCustomers(custData.customers || []);
    } catch {
      setToast({ message: 'Failed to load invoices', type: 'error' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      const res = await fetch(`/api/dashboard/invoices?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setToast({ message: data.error, type: 'error' }); return; }
      setInvoices(prev => prev.filter(i => i.id !== id));
      setToast({ message: data.message, type: 'success' });
    } catch { setToast({ message: 'Failed to delete', type: 'error' }); }
  };

  const handleSendReminder = (inv: Invoice) => {
    setToast({ message: `Payment reminder queued for ${inv.customer.name} (${inv.invoiceNumber})`, type: 'success' });
  };

  const exportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Amount', 'Tax', 'Total', 'Paid', 'Status', 'Days Overdue'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber, inv.customer.name,
      new Date(inv.issueDate).toLocaleDateString('en-IN'),
      new Date(inv.dueDate).toLocaleDateString('en-IN'),
      inv.amount, inv.taxAmount, inv.totalAmount, inv.paidAmount,
      inv.status, inv.daysOverdue,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const has90Plus = invoices.some(inv => inv.agingBucket === '90PLUS' && inv.status !== 'PAID' && inv.status !== 'CANCELLED');
  const totalAging = summary.agingBreakdown.current + summary.agingBreakdown.d30 + summary.agingBreakdown.d60 + summary.agingBreakdown.d90plus;
  const collectionRate = (summary.totalAR + summary.paidThisMonth) > 0
    ? Math.round((summary.paidThisMonth / (summary.totalAR + summary.paidThisMonth)) * 100)
    : 0;

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .inv-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* 90+ Day Overdue Banner */}
      {has90Plus && (
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2, #fef2f2)',
          border: '1px solid #fecaca', borderRadius: 12, padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 14 }}>Critical: 90+ Day Overdue Invoices Detected</div>
            <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 2 }}>You have invoices outstanding for over 90 days. Immediate collection action is recommended to prevent bad debt write-offs.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Invoice & Accounts Receivable</h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>Track outstanding invoices, aging, and collections in real-time</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            ⬇ Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            + New Invoice
          </button>
        </div>
      </div>

      {/* AR Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: 24, gap: 16 }}>
        <div className="col-4" style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Outstanding AR</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>{fmt(summary.totalAR)}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{filteredInvoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').length} open invoices</div>
        </div>
        <div className="col-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff)', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Overdue AR</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#EF4444', fontFamily: 'Outfit, sans-serif' }}>{fmt(summary.overdueAR)}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{invoices.filter(i => i.status === 'OVERDUE').length} overdue invoices</div>
        </div>
        <div className="col-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #fff)', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Collected This Month</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>{fmt(summary.paidThisMonth)}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{invoices.filter(i => i.status === 'PAID').length} total paid invoices</div>
        </div>
        <div className="col-4" style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(11,31,58,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Collection Rate</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: collectionRate >= 80 ? '#10B981' : collectionRate >= 60 ? '#F59E0B' : '#EF4444', fontFamily: 'Outfit, sans-serif' }}>{collectionRate}%</div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${collectionRate}%`, background: collectionRate >= 80 ? '#10B981' : collectionRate >= 60 ? '#F59E0B' : '#EF4444', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Aging Buckets Visual */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Accounts Receivable Aging</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Current', value: summary.agingBreakdown.current, color: '#10B981', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: '1–30 Days', value: summary.agingBreakdown.d30, color: '#F59E0B', bg: '#fffbeb', border: '#fde68a' },
            { label: '31–60 Days', value: summary.agingBreakdown.d60, color: '#F97316', bg: '#fff7ed', border: '#fed7aa' },
            { label: '90+ Days', value: summary.agingBreakdown.d90plus, color: '#EF4444', bg: '#fef2f2', border: '#fecaca' },
          ].map(bucket => {
            const pct = totalAging > 0 ? Math.round((bucket.value / totalAging) * 100) : 0;
            return (
              <div key={bucket.label} style={{ background: bucket.bg, border: `1px solid ${bucket.border}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{bucket.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: bucket.color, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>{fmt(bucket.value)}</div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: bucket.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: bucket.color, fontWeight: 600 }}>{pct}% of AR</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(11,31,58,0.05)', border: '1px solid #f1f5f9', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
          <input className="form-input" placeholder="Search invoices or customer..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, margin: 0 }} />
        </div>
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ margin: 0, minWidth: 150 }}>
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <span style={{ color: '#9ca3af', fontSize: 13 }}>{filteredInvoices.length} invoices</span>
      </div>

      {/* Invoice Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        {loading ? (
          <div style={{ padding: 24 }}><SkeletonTable /></div>
        ) : filteredInvoices.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <h3 style={{ margin: '0 0 8px', color: '#374151', fontFamily: 'Outfit, sans-serif' }}>No invoices found</h3>
            <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: 14 }}>Create your first invoice to start tracking accounts receivable.</p>
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Invoice</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Aging', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="inv-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0B1F3A', fontFamily: 'monospace' }}>#{inv.invoiceNumber}</div>
                      {inv.description && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.description}</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{inv.customer.name}</div>
                      <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#f1f5f9', color: '#6b7280' }}>{inv.customer.riskTier}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 12 }}>{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: inv.daysOverdue > 0 ? '#EF4444' : '#374151', fontWeight: inv.daysOverdue > 0 ? 600 : 400 }}>
                        {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                      </div>
                      {inv.daysOverdue > 0 && <div style={{ fontSize: 10, color: '#EF4444' }}>+{inv.daysOverdue}d overdue</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0B1F3A', fontFamily: 'Outfit, sans-serif' }}>{fmt(inv.totalAmount)}</div>
                      {inv.paidAmount > 0 && <div style={{ fontSize: 11, color: '#10B981' }}>Paid: {fmt(inv.paidAmount)}</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...getStatusStyle(inv.status), padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: 11 }}>{inv.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500,
                        background: inv.agingBucket === 'CURRENT' ? '#dcfce7' : inv.agingBucket === '30' ? '#fef9c3' : inv.agingBucket === '60' ? '#ffedd5' : '#fee2e2',
                        color: inv.agingBucket === 'CURRENT' ? '#166534' : inv.agingBucket === '30' ? '#854d0e' : inv.agingBucket === '60' ? '#9a3412' : '#991b1b',
                      }}>
                        {inv.agingBucket === 'CURRENT' ? 'Current' : inv.agingBucket === '30' ? '1–30 days' : inv.agingBucket === '60' ? '31–60 days' : '90+ days'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button className="btn btn-sm" onClick={() => setPayInvoice(inv)} style={{ fontSize: 11, padding: '3px 8px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 500 }}>
                            ✓ Pay
                          </button>
                        )}
                        {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                          <button onClick={() => handleSendReminder(inv)} style={{ fontSize: 11, padding: '3px 8px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 500 }}>
                            📧 Remind
                          </button>
                        )}
                        <button onClick={() => handleDelete(inv.id)} style={{ fontSize: 11, padding: '3px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNew && (
        <NewInvoiceModal
          customers={customers}
          onClose={() => setShowNew(false)}
          onSuccess={(inv) => {
            setInvoices(prev => [inv, ...prev]);
            setShowNew(false);
            setToast({ message: `Invoice #${inv.invoiceNumber} created successfully`, type: 'success' });
            fetchData();
          }}
        />
      )}
      {payInvoice && (
        <MarkPaidModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onSuccess={(updated) => {
            setInvoices(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
            setPayInvoice(null);
            setToast({ message: `Invoice #${payInvoice.invoiceNumber} updated to ${updated.status}`, type: 'success' });
            fetchData();
          }}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
