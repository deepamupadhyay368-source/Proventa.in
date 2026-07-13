'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, CornerDownRight } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I am the Proventa AI Credit Intelligence Assistant. Ask me to generate a 'Credit Memo' for a company, perform 'Due Diligence', 'Compare' portfolio companies, or forecast 'Risk trends'."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', text: `Sorry, I failed to process that. Error: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseText = (text: string) => {
    // Simple helper to render bold text, bullets, and tables inside chat messages
    const lines = text.split('\n');
    let isTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const parsedElements = lines.map((line, idx) => {
      // Parse tables
      if (line.startsWith('|')) {
        isTable = true;
        const columns = line.split('|').map(c => c.trim()).filter(c => c !== '');
        
        // Skip separator line
        if (line.includes('---')) return null;
        
        if (tableHeaders.length === 0) {
          tableHeaders = columns;
          return null;
        } else {
          tableRows.push(columns);
          return null;
        }
      }

      // If table ended, render it
      if (isTable && !line.startsWith('|')) {
        isTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];

        return (
          <div key={`table-${idx}`} style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  {currentHeaders.map((h, hidx) => (
                    <th key={hidx} style={{ padding: '0.5rem' }}>{h.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((r, ridx) => (
                  <tr key={ridx}>
                    {r.map((td, tdidx) => (
                      <td key={tdidx} style={{ padding: '0.5rem' }}>{td.replace(/\*\*/g, '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Headers (e.g. ### Header)
      if (line.startsWith('###')) {
        return <h3 key={idx} style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, fontFamily: 'Outfit' }}>{line.replace('###', '')}</h3>;
      }
      if (line.startsWith('####')) {
        return <h4 key={idx} style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{line.replace('####', '')}</h4>;
      }

      // Bullets
      if (line.startsWith('*') || line.startsWith('-')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0 0.25rem 0.5rem' }}>
            <span style={{ color: 'var(--primary)' }}>•</span>
            <span style={{ fontSize: '0.875rem' }}>{parseBold(line.substring(1).trim())}</span>
          </div>
        );
      }

      // Empty space
      if (!line.trim()) return <div key={idx} style={{ height: '0.5rem' }} />;

      return <p key={idx} style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{parseBold(line)}</p>;
    });

    // If final block was a table that hasn't been rendered yet
    if (tableHeaders.length > 0) {
      parsedElements.push(
        <div key="final-table" style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {tableHeaders.map((h, hidx) => (
                  <th key={hidx} style={{ padding: '0.5rem' }}>{h.replace(/\*\*/g, '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r, ridx) => (
                <tr key={ridx}>
                  {r.map((td, tdidx) => (
                    <td key={tdidx} style={{ padding: '0.5rem' }}>{td.replace(/\*\*/g, '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return parsedElements;
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary animate-fade-in"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          borderRadius: 'var(--radius-full)',
          width: '56px',
          height: '56px',
          padding: 0,
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
          zIndex: 1000
        }}
      >
        <Sparkles size={24} />
      </button>

      {/* Slide-out Sidebar Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(var(--primary-rgb), 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, var(--primary), var(--info))',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontFamily: 'Outfit', fontWeight: 700 }}>Proventa AI Copilot</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Active Credit Intelligence</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                display: 'flex',
                gap: '0.75rem',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                maxWidth: '85%'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: m.sender === 'user' ? 'var(--secondary)' : 'rgba(var(--primary-rgb), 0.1)',
                  color: m.sender === 'user' ? 'var(--foreground)' : 'var(--primary)',
                  flexShrink: 0
                }}>
                  {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div style={{
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--secondary)',
                  color: m.sender === 'user' ? 'white' : 'var(--foreground)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {m.sender === 'user' ? <p style={{ fontSize: '0.875rem' }}>{m.text}</p> : parseText(m.text)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: 'var(--secondary)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Chips */}
          <div style={{ padding: '0.5rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
            {[
              'Compare portfolio risk',
              'Draft demand notice for Acme Corp',
              'Legal audit: Delta Shipping Ltd',
              'Roc compliance calendar summary',
              'Explain board network: Delta Shipping Ltd'
            ].map((shortcut, sidx) => (
              <button
                key={sidx}
                onClick={() => handleSendMessage(shortcut)}
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CornerDownRight size={10} />
                {shortcut}
              </button>
            ))}
          </div>

          {/* Footer Input Bar */}
          <div style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              placeholder="Ask Copilot..."
              className="form-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              style={{ margin: 0 }}
            />
            <button
              onClick={() => handleSendMessage(input)}
              className="btn btn-primary"
              style={{ padding: '0.75rem', width: '42px', height: '42px', borderRadius: 'var(--radius-sm)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
