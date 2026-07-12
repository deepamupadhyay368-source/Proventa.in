'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Mail, 
  User, 
  Building, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle,
  Sun,
  Moon
} from 'lucide-react';

export default function WaitlistPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Form Steps: 1 = Contact, 2 = Company, 3 = Priorities, 4 = Ticket
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('Manufacturing');
  const [revenue, setRevenue] = useState('10000000');
  const [priority, setPriority] = useState('DSO Reduction');

  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [accessTier, setAccessTier] = useState('Gold');
  const [error, setError] = useState('');

  const nextStep = () => {
    if (step === 1 && (!name || !email)) {
      setError('Please fill in your name and email credentials.');
      return;
    }
    if (step === 2 && !company) {
      setError('Please enter your company name.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Determine access tier based on revenue parameters
    const revVal = parseFloat(revenue);
    let calculatedTier = 'Gold';
    if (revVal >= 50000000) calculatedTier = 'Platinum';
    else if (revVal >= 100000000) calculatedTier = 'Infinite Enterprise';

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          industry,
          revenue,
          priority: calculatedTier
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setPosition(data.position);
      setAccessTier(data.priority);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--background)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow backgrounds */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
        top: '-15%',
        right: '-10%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
        bottom: '-15%',
        left: '-10%',
        zIndex: 0
      }} />

      {/* Floating Theme Button */}
      <button 
        onClick={toggleTheme}
        className="theme-switch"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
          padding: '0.6rem',
          zIndex: 10
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="card animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '3rem',
        zIndex: 1,
        position: 'relative',
        boxShadow: 'var(--shadow-2xl)',
        borderRadius: '24px'
      }}>
        {step < 4 && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--info-bg)',
                border: '1px solid var(--info-border)',
                borderRadius: '100px',
                padding: '0.35rem 1rem',
                color: 'var(--info)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                <Sparkles size={12} />
                <span>Priority Access Waitlist</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                Join Private Beta
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem', textAlign: 'center' }}>
                Secure your priority index placement for credit automation pipelines.
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  style={{
                    flex: 1,
                    height: '4px',
                    background: s <= step ? 'var(--primary)' : 'var(--border)',
                    borderRadius: '2px',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* STEP 1: Contact Details */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button onClick={nextStep} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Company Demographics */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Company Legal Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="form-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Industry Sector</label>
              <select className="form-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="Manufacturing">Manufacturing & Trade</option>
                <option value="Logistics">Transportation & Logistics</option>
                <option value="Technology">Technology & Fintechs</option>
                <option value="Wholesale">Wholesale Importers</option>
                <option value="Services">Professional Services</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Annual Revenue Range (INR)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <select className="form-input" value={revenue} onChange={(e) => setRevenue(e.target.value)} style={{ paddingLeft: '2.5rem' }}>
                  <option value="5000000">Up to ₹50 Lakhs</option>
                  <option value="20000000">₹50 Lakhs - ₹2 Crores</option>
                  <option value="80000000">₹2 Crores - ₹8 Crores</option>
                  <option value="500000000">₹8 Crores - ₹50 Crores</option>
                  <option value="1000000000">₹50 Crores +</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={prevStep} className="btn btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary" style={{ flex: 2 }}>
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Priorities Selection */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>What is your primary risk automation focus?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { id: 'DSO Reduction', label: 'DSO Reduction & Payment Follow-ups' },
                  { id: 'KYB Scan', label: 'Automated GST/PAN Registration Scans' },
                  { id: 'Bank Analysis', label: 'Bank Statement OCR Cash Flow Ratios' },
                  { id: 'Credit Scopes', label: 'Custom Trade Credit Limit Policies' }
                ].map((item) => (
                  <label 
                    key={item.id}
                    onClick={() => setPriority(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      border: `1px solid ${priority === item.id ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      background: priority === item.id ? 'rgba(37, 99, 235, 0.03)' : 'var(--card)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="priority"
                      checked={priority === item.id}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={prevStep} className="btn btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={handleWaitlistSubmit} className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Submitting...' : 'Register Priority'}
                {!loading && <CheckCircle size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Priority Ticket Access Card */}
        {step === 4 && position && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--success)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <ShieldCheck size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>
              Priority Spot Reserved
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.25rem', marginBottom: '2rem', maxWidth: '380px' }}>
              Your B2B onboarding ticket has been generated. An invitation link has been dispatched to your work email.
            </p>

            {/* Premium Gold/Blue Access Card Card */}
            <div className="waitlist-card-ticket" style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0B1F3A 0%, #1A365D 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'left',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -10px rgba(11, 31, 58, 0.5)',
              marginBottom: '2rem'
            }}>
              {/* Card Watermark Glow */}
              <div style={{
                position: 'absolute',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
                top: '-20%',
                right: '-20%',
                pointerEvents: 'none'
              }} />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: '#ffffff', color: '#0B1F3A', borderRadius: '4px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>P</div>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>PROVENTA KEY</span>
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  {accessTier} Tier
                </div>
              </div>

              {/* Ticket Spot Position */}
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.05em', display: 'block' }}>Onboarding Queue Position</span>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                  #{position}
                </span>
              </div>

              {/* Card Footer Holder */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', display: 'block', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Card Holder</span>
                  <strong style={{ color: '#ffffff' }}>{name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.6rem', display: 'block', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Corporate Identity</span>
                  <strong style={{ color: '#ffffff' }}>{company}</strong>
                </div>
              </div>
            </div>

            <button onClick={() => router.push('/')} className="btn btn-primary" style={{ width: '100%' }}>
              Back to Home page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
