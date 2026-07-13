'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Save, Play, Code, CheckSquare } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function AiAgentConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetch('/api/dashboard/ai-agent')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/ai-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        addToast('success', 'Saved', 'AI Agent configuration updated.');
      } else throw new Error();
    } catch (e) {
      addToast('error', 'Error', 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResponse('');
    try {
      // Fake delay for testing simulation since this is just UI
      await new Promise(r => setTimeout(r, 1500));
      setTestResponse(`Simulation based on your prompt:\n\nBased on the custom system instruction, I have analyzed the request "${testPrompt}". The appropriate action has been calculated according to the active credit policies and rules provided.`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="skeleton-card" />;

  const modules = [
    { id: 'portfolio', label: 'Portfolio Analytics' },
    { id: 'customers', label: 'Customer Risk Intelligence' },
    { id: 'invoices', label: 'Invoices & AR Data' },
    { id: 'gst', label: 'GST Filings' },
    { id: 'forecasting', label: 'AI Forecasting' }
  ];

  const activeModules = (config?.allowedModules || '').split(',');

  const toggleModule = (id: string) => {
    let current = activeModules.filter((m: string) => m.trim());
    if (current.includes(id)) current = current.filter((m: string) => m !== id);
    else current.push(id);
    setConfig({ ...config, allowedModules: current.join(',') });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot size={32} style={{ color: 'var(--primary)' }} />
          Custom AI Agent Studio
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Configure your dedicated AI Copilot's knowledge, permissions, and behavior rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        {/* Left Col: Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Agent Identity & Behavior</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active</span>
                <input 
                  type="checkbox" 
                  checked={config?.isActive || false}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Agent Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={config?.agentName || ''}
                onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">System Instructions (Prompt)</label>
              <textarea 
                className="form-input" 
                rows={6}
                value={config?.systemPrompt || ''}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                placeholder="You are an expert Credit Analyst. Always review the DSO before recommending credit limit increases..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data Access Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                {modules.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <div style={{ color: activeModules.includes(m.id) ? 'var(--primary)' : 'var(--muted)' }}>
                      <CheckSquare size={18} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.label}</span>
                    <input 
                      type="checkbox" 
                      hidden
                      checked={activeModules.includes(m.id)}
                      onChange={() => toggleModule(m.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </div>

        {/* Right Col: Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', height: '100%', background: 'var(--background)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} /> Test Sandbox
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', minHeight: '200px', fontSize: '0.875rem', whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
                {testResponse || <span style={{ color: 'var(--muted)' }}>Agent response will appear here...</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Test prompt..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                />
                <button 
                  className="btn btn-secondary" 
                  onClick={handleTest}
                  disabled={testing || !testPrompt.trim()}
                >
                  {testing ? '...' : <Play size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
