'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { Mail, Lock, User, Building, Sun, Moon, ArrowRight, Chrome, Layers, Apple, Loader2 } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Automatically sign in after signup
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const triggerSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setError('');
    try {
      await signIn(provider.toLowerCase(), { callbackUrl: '/onboarding' });
    } catch (err) {
      setError(`Failed to connect with ${provider}.`);
      setSocialLoading(null);
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
        aria-label="Toggle Theme"
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
          }} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSignupSubmit}>
          {/* Social Logins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => triggerSocialLogin('Google')}
              disabled={!!socialLoading || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {socialLoading === 'Google' ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
              Sign up with Google
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => triggerSocialLogin('Azure-AD')}
              disabled={!!socialLoading || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {socialLoading === 'Azure-AD' ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
              Sign up with Microsoft
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => triggerSocialLogin('Apple')}
              disabled={!!socialLoading || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {socialLoading === 'Apple' ? <Loader2 size={16} className="animate-spin" /> : <Apple size={16} />}
              Sign up with Apple
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or register with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading || !!socialLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="orgName">Organization Name</label>
            <div style={{ position: 'relative' }}>
              <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                id="orgName"
                type="text"
                required
                placeholder="Acme Corporation"
                className="form-input"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading || !!socialLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading || !!socialLoading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                id="password"
                type="password"
                required
                placeholder="At least 8 characters"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading || !!socialLoading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !!socialLoading} style={{ width: '100%', marginBottom: '1.5rem' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : <>Get Started <ArrowRight size={16} /></>}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
