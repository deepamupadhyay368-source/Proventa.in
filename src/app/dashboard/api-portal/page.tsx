'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, Plus, Trash2, Copy, Check, Terminal, Code, Settings } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  status: string;
}

export default function ApiDeveloperPortal() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keyName, setKeyName] = useState('');
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState<'curl' | 'node' | 'python' | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setLoading(true);
    setNewRawKey(null);

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewRawKey(data.rawKey);
      setKeyName('');
      fetchKeys();
    } catch (err: any) {
      alert(`Error generating key: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action will immediately break any ERP or CRM integrations using it.')) {
      return;
    }

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'curl' | 'node' | 'python') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const codeSnippets = {
    curl: `curl -X GET "https://api.proventa.ai/v1/credit/score?cin=U72200KA2020PTC134958" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    node: `const axios = require('axios');

axios.get('https://api.proventa.ai/v1/credit/score?cin=U72200KA2020PTC134958', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`,
    python: `import requests

url = "https://api.proventa.ai/v1/credit/score"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {
    "cin": "U72200KA2020PTC134958"
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>Developer API & Webhooks Portal</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Integrate automated credit decisions into your ERP, CRM, and accounting engines</p>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Keys Management */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Create Key Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={18} style={{ color: 'var(--primary)' }} />
              Developer API Access Tokens
            </h3>

            <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                required 
                placeholder="e.g. ERP Integration Token" 
                className="form-input" 
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                style={{ margin: 0 }}
              />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}>
                <Plus size={16} />
                Generate Key
              </button>
            </form>

            {/* Display Newly Generated Key */}
            {newRawKey && (
              <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <ShieldAlert size={18} />
                  <span>Important: Copy your API key now. It will not be shown again.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <code style={{ flex: 1, background: 'var(--card)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {newRawKey}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(newRawKey, 'key')}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.5rem' }}
                  >
                    {copiedKey ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* List of Keys */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--muted)' }}>
                Active Tokens
              </h4>
              
              {keys.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
                  No API tokens generated yet.
                </span>
              ) : (
                keys.map((k) => (
                  <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{k.name}</strong>
                      <div style={{ fontSize: '0.725rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                        Created: {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRevokeKey(k.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem', color: 'var(--danger)', border: 'none', background: 'none' }}
                      title="Revoke Token"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rate Limits & Policies */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} style={{ color: 'var(--info)' }} />
              API Security & Limits
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--muted)' }}>Rate Limit Policy:</span>
                <strong>1,000 requests / minute</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--muted)' }}>Auth Method:</span>
                <strong>Bearer Token (Header)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>IP Whitelisting:</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Active (Configure in settings)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Code Documentation */}
        <div className="card col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={18} style={{ color: 'var(--success)' }} />
            Developer Integration Documentation
          </h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Query corporate credit ratings, default indexes, and recommended trading limits programmatically:
          </p>

          {/* Curl Docs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Terminal size={14} /> cURL Request
              </span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.curl, 'curl')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {copiedCode === 'curl' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                Copy Code
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #1e293b' }}>
              {codeSnippets.curl}
            </pre>
          </div>

          {/* Node Docs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Code size={14} /> Node.js (Axios)
              </span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.node, 'node')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {copiedCode === 'node' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                Copy Code
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #1e293b' }}>
              {codeSnippets.node}
            </pre>
          </div>

          {/* Python Docs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Code size={14} /> Python (Requests)
              </span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.python, 'python')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {copiedCode === 'python' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                Copy Code
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #1e293b' }}>
              {codeSnippets.python}
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
}
