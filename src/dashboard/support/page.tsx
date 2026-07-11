'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertCircle, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // FAQ search
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    { q: 'How is the Proventa Credit Score calculated?', a: 'Scores are computed using liquidity margins, debt-to-equity leverage, and historical payment delays, heavily penalized by active litigations.' },
    { q: 'Can I connect my ERP directly to Proventa?', a: 'Yes. Use your developer portal token to call our REST APIs. Endpoints support SAP, Oracle, NetSuite, and QuickBooks integrations.' },
    { q: 'How often is business litigation updated?', a: 'Active court records, civil lawsuits, and corporate registry filings are monitored continuously and updated on a daily schedule.' },
    { q: 'What compliance frameworks does Proventa support?', a: 'Proventa aligns with GDPR data privacy policies and implements SOC 2 secure Zero Trust network isolation controls.' },
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/ticket');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, priority }),
      });

      if (res.ok) {
        setSubject('');
        setMessage('');
        setSuccess(true);
        fetchTickets();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>Customer Support Center</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Access our credit knowledge base or contact corporate support engineering</p>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Submit Ticket */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              Submit Support Ticket
            </h3>

            {success && (
              <div className="badge badge-success" style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                <CheckCircle size={16} />
                <span>Support ticket filed successfully. Our agents will respond within 4 hours.</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. ERP Webhook failing to trigger" 
                  className="form-input" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="form-group">
                <div>
                  <label className="form-label">Severity Level</label>
                  <select 
                    className="form-input" 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low - General Question</option>
                    <option value="MEDIUM">Medium - Technical Issue</option>
                    <option value="HIGH">High - API Downtime</option>
                    <option value="URGENT">Urgent - Platform Interruption</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description Details</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="Provide details about the issue or question..." 
                  className="form-input" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} />
                {loading ? 'Submitting...' : 'File Ticket'}
              </button>
            </form>
          </div>

          {/* List of past tickets */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--muted)' }}>
              Ticket History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tickets.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
                  No support tickets filed.
                </span>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} style={{ padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{t.subject}</strong>
                      <div style={{ fontSize: '0.725rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                        Filed: {new Date(t.createdAt).toLocaleDateString()} • Priority: <span style={{ fontWeight: 600 }}>{t.priority}</span>
                      </div>
                    </div>
                    <span className={`badge ${t.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: FAQ Search */}
        <div className="card col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} style={{ color: 'var(--success)' }} />
            Knowledge Base FAQ
          </h3>

          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="form-input" 
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredFaqs.map((faq, fidx) => (
              <div key={fidx} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.08)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  Q
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>{faq.q}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>{faq.a}</p>
                </div>
              </div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>No articles matched your search.</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
