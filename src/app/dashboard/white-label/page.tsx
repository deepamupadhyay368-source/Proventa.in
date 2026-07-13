'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Link as LinkIcon, Image as ImageIcon, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function WhiteLabelPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetch('/api/dashboard/white-label')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        addToast('success', 'Saved', 'Brand configuration updated successfully.');
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      addToast('error', 'Error', 'Could not save brand configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton-card" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Palette size={32} style={{ color: 'var(--primary)' }} />
          White Label Branding
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Customize the platform to match your organization's brand identity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 700 }}>Brand Settings</h3>
            
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={config?.companyName || ''} 
                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <ImageIcon size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={config?.logoUrl || ''} 
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Primary Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={config?.primaryColor || '#0B1F3A'} 
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  />
                  <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{config?.primaryColor}</span>
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={config?.accentColor || '#2563EB'} 
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  />
                  <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{config?.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Domain</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={config?.customDomain || ''} 
                    onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                    placeholder="app.yourdomain.com"
                  />
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', height: '100%', background: 'var(--background)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Live Preview</h3>
            
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}>
              {/* Fake App Header */}
              <div style={{ 
                height: '60px', 
                background: config?.primaryColor || 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                color: 'white',
                gap: '1rem'
              }}>
                {config?.logoUrl ? (
                  <img src={config?.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain', background: 'white', padding: '4px', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                )}
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{config?.companyName || 'My Company'}</span>
              </div>
              
              {/* Fake App Content */}
              <div style={{ padding: '2rem' }}>
                <div style={{ width: '60%', height: '24px', background: 'var(--border)', borderRadius: '4px', marginBottom: '1.5rem' }} />
                <button style={{ 
                  background: config?.accentColor || 'var(--secondary)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  Primary Action
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Enterprise Feature Active</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Your current plan includes full white-label support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
