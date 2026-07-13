'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Building2,
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';

const INDUSTRIES = [
  'Manufacturing', 'Logistics & Transport', 'Technology & IT Services',
  'Wholesale & Distribution', 'Professional Services', 'Healthcare & Pharma',
  'Retail', 'Construction & Infrastructure', 'FMCG', 'Financial Services', 'Other',
];

const COMPANY_SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '201–500 employees', '500+ employees'];

const USE_CASES = [
  { id: 'credit_scoring', label: 'AI Credit Scoring' },
  { id: 'invoice_tracking', label: 'Invoice Tracking & AR' },
  { id: 'gst_compliance', label: 'GST Compliance Monitoring' },
  { id: 'ai_forecasting', label: 'AI Financial Forecasting' },
  { id: 'benchmarking', label: 'Industry Benchmarking' },
  { id: 'risk_alerts', label: 'Risk Alerts & Monitoring' },
];

const TIME_SLOTS = [
  '10:00 AM – 10:30 AM', '11:00 AM – 11:30 AM',
  '12:00 PM – 12:30 PM', '2:00 PM – 2:30 PM',
  '3:00 PM – 3:30 PM', '4:00 PM – 4:30 PM',
];

const TRUST_METRICS = [
  { value: '500+', label: 'SMEs Trust Proventa' },
  { value: '₹2,400 Cr+', label: 'AR Portfolio Managed' },
  { value: '98.2%', label: 'Customer Satisfaction' },
  { value: '< 72hrs', label: 'Average Onboarding Time' },
];

const FEATURES = [
  { icon: <Zap size={18} color="#F59E0B" />, title: 'AI Credit Scoring in Minutes', desc: 'Generate comprehensive credit reports powered by Gemini AI — not weeks.' },
  { icon: <Shield size={18} color="#10B981" />, title: 'Bank-Grade Data Security', desc: 'AES-256 encryption, zero-trust architecture, and PDPB compliance.' },
  { icon: <TrendingUp size={18} color="#2563EB" />, title: 'Predictive Financial Intelligence', desc: 'Forecast revenue, cash flow, and default risk up to 12 months ahead.' },
];

type FormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  companySize: string;
  industry: string;
  useCases: string[];
  preferredDate: string;
  preferredSlot: string;
  message: string;
};

export default function BookDemoPage() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', company: '', phone: '',
    companySize: '', industry: '', useCases: [],
    preferredDate: '', preferredSlot: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleUseCase(id: string) {
    setForm(prev => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter(u => u !== id)
        : [...prev.useCases, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error(data.error || 'Booking failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0B1F3A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>P</div>
          <span style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>PROVENTA</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
          <Link href="/signup" style={{ background: '#2563EB', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Start Free</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'start' }}>

        {/* ── Left Column: Value Prop ────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', letterSpacing: '0.06em' }}>BOOK A LIVE DEMO</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: '#0B1F3A', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            See How Proventa<br />
            <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Transforms Credit Decisions</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '2rem' }}>
            In a 30-minute personalized demo, our team will walk you through how Proventa reduces debtor default risk, accelerates collections, and provides AI-powered insights for your portfolio.
          </p>

          {/* Trust Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            {TRUST_METRICS.map((m) => (
              <div key={m.label} style={{ padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#0B1F3A' }}>{m.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1F3A', marginBottom: '0.2rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo includes */}
          <div style={{ padding: '1.25rem', background: 'rgba(11,31,58,0.04)', borderRadius: '10px', border: '1px solid rgba(11,31,58,0.1)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A', marginBottom: '0.75rem' }}>Your demo includes:</div>
            {[
              'Live credit assessment walkthrough with real data',
              'AI forecasting demonstration for your industry',
              'Custom pricing for your team size',
              'Q&A with a Proventa credit specialist',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#374151' }}>
                <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: Demo Form or Success ────────────────────────────── */}
        <div>
          {success ? (
            // Success State
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem 2.5rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={36} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.75rem' }}>
                Demo Confirmed! 🎉
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Thank you, <strong>{form.name}</strong>! Your demo request has been received. Our team will confirm your slot within 2 business hours and send a calendar invite to <strong>{form.email}</strong>.
              </p>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>📅 Booking Summary</div>
                <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.7 }}>
                  <div><strong>Company:</strong> {form.company}</div>
                  {form.preferredDate && <div><strong>Preferred Date:</strong> {form.preferredDate}</div>}
                  {form.preferredSlot && <div><strong>Preferred Time:</strong> {form.preferredSlot}</div>}
                  <div><strong>Duration:</strong> 30 minutes</div>
                  <div><strong>Format:</strong> Video call (Google Meet / Zoom)</div>
                </div>
              </div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0B1F3A', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                Back to Home <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            // Form
            <form
              onSubmit={handleSubmit}
              style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
            >
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.35rem' }}>
                Book Your Free Demo
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1.75rem' }}>Usually available within 24–48 business hours. No commitment required.</p>

              {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: '8px', color: '#EF4444', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Work Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@company.com" required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Company Name *</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Exports Pvt. Ltd." required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Company Size</label>
                  <select name="companySize" value={form.companySize} onChange={handleChange} style={inputStyle}>
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Industry</label>
                  <select name="industry" value={form.industry} onChange={handleChange} style={inputStyle}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Use Cases */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>What are you most interested in?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {USE_CASES.map((uc) => (
                    <label key={uc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: `1px solid ${form.useCases.includes(uc.id) ? '#2563EB' : '#e2e8f0'}`, borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', color: '#374151', background: form.useCases.includes(uc.id) ? 'rgba(37,99,235,0.05)' : '#fff', transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={form.useCases.includes(uc.id)} onChange={() => toggleUseCase(uc.id)} style={{ accentColor: '#2563EB' }} />
                      {uc.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Slot Picker */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    <Calendar size={12} style={{ marginRight: '0.25rem', display: 'inline' }} />Preferred Date
                  </label>
                  <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    <Clock size={12} style={{ marginRight: '0.25rem', display: 'inline' }} />Preferred Time (IST)
                  </label>
                  <select name="preferredSlot" value={form.preferredSlot} onChange={handleChange} style={inputStyle}>
                    <option value="">Select a slot</option>
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Anything specific you'd like us to cover?</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="E.g., We manage 200+ trade debtors and want to automate credit limits..." rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '0.9rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0B1F3A, #2563EB)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Scheduling your demo...
                  </>
                ) : (
                  <>Schedule My Free Demo <ArrowRight size={16} /></>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                No credit card required. By submitting, you agree to our{' '}
                <Link href="/privacy" style={{ color: '#2563EB' }}>Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0B1F3A', color: 'rgba(255,255,255,0.6)', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <p style={{ margin: 0 }}>© 2025 Proventa Technologies Private Limited. All rights reserved. &nbsp;|&nbsp;
          <Link href="/privacy" style={{ color: '#60a5fa' }}>Privacy</Link> &nbsp;|&nbsp;
          <Link href="/terms" style={{ color: '#60a5fa' }}>Terms</Link>
        </p>
      </footer>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.85rem',
  color: '#0B1F3A',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};
