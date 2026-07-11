'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserPlus, Key } from 'lucide-react';

export default function GoogleSSOPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const preconfiguredProfiles = [
    { name: 'Deepam Finance Analyst', email: 'deepam.analyst@gmail.com', id: '1092839281' },
    { name: 'System Admin Account', email: 'admin@proventa.io', id: '8872635272' },
  ];

  const handleGoogleLogin = async (profile: { name: string; email: string; id: string }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          googleId: profile.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google Login failed');

      // Check if user has an onboarded company or redirect to onboarding / dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    handleGoogleLogin({
      name,
      email,
      id: `google_${Date.now()}`
    });
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f0f4f9', // Google Accounts slate-white background
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Google G Logo icon using custom CSS color gradients */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span>
          <span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span>
          <span style={{ color: '#EA4335' }}>e</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#202124', textAlign: 'center', margin: '0 0 0.5rem 0' }}>
          {customMode ? 'Create new Google SSO Account' : 'Sign in with Google'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#202124', marginBottom: '2rem', textAlign: 'center' }}>
          to continue to <strong style={{ color: '#1a73e8' }}>proventa.ai</strong>
        </p>

        {error && (
          <div style={{
            background: '#fce8e6',
            color: '#c5221f',
            fontSize: '0.85rem',
            padding: '0.75rem',
            borderRadius: '4px',
            width: '100%',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTopColor: '#1a73e8', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem', color: '#5f6368' }}>Securely authenticating Google Profile...</span>
          </div>
        ) : !customMode ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Profiles List */}
            {preconfiguredProfiles.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => handleGoogleLogin(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid #dadce0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderRadius: idx === 0 ? '4px 4px 0 0' : idx === preconfiguredProfiles.length - 1 ? '0 0 4px 4px' : '0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f8f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1a73e8',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {p.name[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3c4043' }}>{p.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#5f6368', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.email}</span>
                </div>
              </div>
            ))}

            {/* Custom choice */}
            <button 
              onClick={() => setCustomMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
                background: 'none',
                border: '1px dashed #1a73e8',
                color: '#1a73e8',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <UserPlus size={16} />
              Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c4043' }}>Your Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Google Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: '0.65rem 0.75rem',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c4043' }}>Google Account Email</label>
              <input 
                type="email" 
                required 
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '0.65rem 0.75rem',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setCustomMode(false)}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  padding: '0.65rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#5f6368'
                }}
              >
                Back
              </button>
              <button 
                type="submit"
                style={{
                  flex: 1,
                  background: '#1a73e8',
                  border: 'none',
                  color: 'white',
                  padding: '0.65rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Confirm SSO
              </button>
            </div>
          </form>
        )}

        {/* Security badge at bottom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2.5rem', fontSize: '0.75rem', color: '#5f6368' }}>
          <ShieldCheck size={14} style={{ color: '#34a853' }} />
          Secure Google OAuth Integration Sandbox
        </div>
      </div>
    </div>
  );
}
