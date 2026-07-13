'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { Shield, Mail, Lock, Sun, Moon, ArrowRight, Chrome, Layers } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // MFA Step
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [otp, setOtp] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server returned an unexpected response. Please try again later.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Successful login triggers MFA / OTP step for premium security demonstration
      setTempUser(data);
      setStep('mfa');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login/verify-otp', {
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

      router.push('/dashboard');
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

  // Modern Enterprise styling theme constants
  const bg = theme === 'dark' ? '#060a12' : '#f8fafc';
  const cardBg = theme === 'dark' ? '#0c111e' : '#ffffff';
  const borderColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827';
  const mutedColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const inputBg = theme === 'dark' ? '#0b0f19' : '#ffffff';
  const primaryBtnBg = theme === 'dark' ? '#2563eb' : '#0B1F3A';
  const secondaryBtnBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const secondaryBtnText = theme === 'dark' ? '#cbd5e1' : '#475569';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: bg,
      color: textColor,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        bottom: '-20%',
        right: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Floating Theme Button */}
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: cardBg,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '10px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          padding: '0.6rem',
          zIndex: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1,
        position: 'relative',
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            borderRadius: '12px',
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            PROVENTA
          </h1>
          <p style={{ color: mutedColor, fontSize: '0.85rem', marginTop: '0.4rem', textAlign: 'center', fontWeight: 500, lineHeight: '1.4' }}>
            Create your enterprise developer portal & credit engine
          </p>
        </div>

        {error && (
          <div style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {step === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '0.85rem 1.125rem 0.85rem 2.5rem',
                    background: inputBg,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <a href="#" style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#3b82f6' : '#2563eb', fontWeight: 700 }} onClick={() => alert('Password reset simulation triggered. Check email connector logs.')}>
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '0.85rem 1.125rem 0.85rem 2.5rem',
                    background: inputBg,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                background: primaryBtnBg,
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Social Logins */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: borderColor }} />
              <span style={{ fontSize: '0.7rem', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Or connect with</span>
              <div style={{ flex: 1, height: '1px', background: borderColor }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => triggerSocialLogin('Google')}
                style={{
                  background: secondaryBtnBg,
                  color: secondaryBtnText,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <Chrome size={16} />
                Google
              </button>
              <button 
                type="button" 
                onClick={() => triggerSocialLogin('Microsoft')}
                style={{
                  background: secondaryBtnBg,
                  color: secondaryBtnText,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <Layers size={16} />
                Microsoft
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: mutedColor, marginTop: '0.5rem' }}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb', fontWeight: 700 }}>
                Sign Up
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: theme === 'dark' ? 'rgba(37,99,235,0.1)' : '#eff6ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                marginBottom: '0.5rem'
              }}>
                <Shield size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: textColor, margin: 0 }}>Multi-Factor Authentication</h2>
              <p style={{ fontSize: '0.8rem', color: mutedColor, margin: 0 }}>
                We sent a 6-digit OTP verification code to <strong>{tempUser?.email}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.5em',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '0.85rem 1.125rem',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              style={{
                width: '100%',
                background: primaryBtnBg,
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Verify OTP
            </button>

            <button 
              type="button" 
              onClick={() => setStep('login')}
              style={{
                width: '100%',
                background: 'transparent',
                color: mutedColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '0.65rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
