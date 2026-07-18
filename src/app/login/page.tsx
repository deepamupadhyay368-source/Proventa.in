'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { Shield, Mail, Lock, Sun, Moon, ArrowRight, Chrome, Layers, Apple, Loader2 } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setError('');
    try {
      await signIn(provider.toLowerCase(), { callbackUrl: '/dashboard' });
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
      padding: '1rem',
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
        maxWidth: '460px',
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
            Enterprise AI Credit Intelligence Platform
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

        <form onSubmit={handleLoginSubmit}>
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
              Continue with Google
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => triggerSocialLogin('Azure-AD')}
              disabled={!!socialLoading || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {socialLoading === 'Azure-AD' ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
              Continue with Microsoft
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => triggerSocialLogin('Apple')}
              disabled={!!socialLoading || loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {socialLoading === 'Apple' ? <Loader2 size={16} className="animate-spin" /> : <Apple size={16} />}
              Continue with Apple
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading || !!socialLoading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="rememberMe" style={{ marginRight: '0.5rem' }} />
            <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Remember me</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !!socialLoading} style={{ width: '100%', marginBottom: '1.5rem' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : <>Sign In <ArrowRight size={16} /></>}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
            By signing in, you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>.
          </div>
        </form>
      </div>
    </div>
  );
}
