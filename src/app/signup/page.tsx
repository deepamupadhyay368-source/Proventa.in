'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { Mail, Lock, User, Building, Sun, Moon, ArrowRight, Chrome, Layers } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification Step
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [otp, setOtp] = useState('');

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push('/dashboard');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server returned an unexpected response. Please try again later.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.verificationRequired) {
        setStep('otp');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server returned an unexpected response. Please try again later.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      router.push('/login/google');
    } else {
      alert(`Connecting to external authentication provider: ${provider} Secure SSO Integration.`);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--background)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        bottom: '-20%',
        right: '-10%',
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
        maxWidth: '480px',
        padding: '2.5rem',
        zIndex: 1,
        position: 'relative',
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, var(--primary), var(--info))',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.5rem',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            P
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
            PROVENTA
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem', textAlign: 'center' }}>
            Create your enterprise developer portal & credit engine
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {step === 'signup' ? (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Acme Corporation"
                  className="form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="At least 14 characters"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '1.5rem' }}>
              {loading ? 'Registering...' : 'Get Started'}
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Social Logins */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or register with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerSocialLogin('Google')}>
                <Chrome size={16} />
                Google
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerSocialLogin('Microsoft')}>
                <Layers size={16} />
                Microsoft
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--warning-bg)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning)',
                border: '1px solid var(--warning-border)',
                marginBottom: '0.5rem'
              }}>
                <Mail size={20} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--foreground)' }}>Verify Your Email</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                We sent a 6-digit verification code to <strong>{email}</strong>.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                className="form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setStep('signup')}>
              Back to Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
