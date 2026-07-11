'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Database, Share2, Activity, RefreshCw, Key, ShieldCheck, 
  Smartphone, Plus, X, Search, FileText, CheckCircle, AlertTriangle, 
  AlertCircle, Trash2, ArrowRight, MessageSquare, Send, Sparkles, Pin, BookOpen, ThumbsUp, ThumbsDown, Star
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Summarize this month\'s receivables.',
  'Explain our company credit scores & rating.',
  'Check active integration connections status.',
  'Summarize compliance audit parameters.'
];

const PROMPT_TEMPLATES = [
  { label: 'Ratio Analysis', prompt: 'Perform a ratio analysis on the primary company profile.' },
  { label: 'DSO Investigation', prompt: 'Explain why DSO is increasing and suggest collections priorities.' },
  { label: 'KYC & Due Diligence', prompt: 'Audit government portal registrations and active litigations.' }
];

export default function AIWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'recommendations' | 'knowledge'>('workspace');
  
  // Conversations memory states
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Explainability sidebar details
  const [activeAgent, setActiveAgent] = useState('KNOWLEDGE');
  const [activeConfidence, setActiveConfidence] = useState(90);
  const [activeReasoning, setActiveReasoning] = useState('Default search and general knowledge retrieval.');
  const [activeCitations, setActiveCitations] = useState<any[]>([]);
  
  // Recommendations states
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsMessage, setRecommendationsMessage] = useState('');

  // Knowledge base states
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', category: 'POLICY' });
  const [knowledgeMessage, setKnowledgeMessage] = useState('');

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [loadingReply, setLoadingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchRecommendations();
    fetchKnowledgeDocs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingReply]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/dashboard/ai/chat');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !activeConvId) {
          handleSelectConversation(data.conversations[0]);
        }
      }
    } catch (e) {}
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/dashboard/ai/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (e) {}
  };

  const fetchKnowledgeDocs = async () => {
    try {
      const res = await fetch('/api/dashboard/ai/knowledge');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeDocs(data.documents || []);
      }
    } catch (e) {}
  };

  const handleSelectConversation = (conv: any) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
    
    // Load last message explainability context to sidebar
    const lastAssistantMsg = [...(conv.messages || [])]
      .reverse()
      .find(m => m.role === 'ASSISTANT');
      
    if (lastAssistantMsg && lastAssistantMsg.explainability) {
      const exp = JSON.parse(lastAssistantMsg.explainability);
      setActiveAgent(exp.agentType || 'KNOWLEDGE');
      setActiveConfidence(exp.confidenceScore || 90);
      setActiveReasoning(exp.reasoning || '');
      setActiveCitations(JSON.parse(lastAssistantMsg.citations || '[]'));
    } else {
      setActiveAgent('KNOWLEDGE');
      setActiveConfidence(90);
      setActiveReasoning('No explainable context loaded.');
      setActiveCitations([]);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setActiveAgent('KNOWLEDGE');
    setActiveConfidence(90);
    setActiveReasoning('Ready to start a new business intelligence chat.');
    setActiveCitations([]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setInputMessage('');
    setLoadingReply(true);

    // Optimistically push user message
    const tempUserMsg = { id: 'temp_user', role: 'USER', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/dashboard/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: activeConvId })
      });

      const data = await res.json();
      if (res.ok) {
        // Update conversation ID if newly created
        if (!activeConvId) {
          setActiveConvId(data.conversationId);
        }

        const tempAssistantMsg = {
          id: data.messageId,
          role: 'ASSISTANT',
          content: data.reply,
          citations: JSON.stringify(data.citations),
          explainability: JSON.stringify({
            confidenceScore: data.confidenceScore,
            reasoning: data.reasoning,
            agentType: data.agentType
          }),
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev.filter(m => m.id !== 'temp_user'), tempUserMsg, tempAssistantMsg]);
        
        // Update explainability bar
        setActiveAgent(data.agentType);
        setActiveConfidence(data.confidenceScore);
        setActiveReasoning(data.reasoning);
        setActiveCitations(data.citations || []);

        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReply(false);
    }
  };

  const handleOpenFeedback = (messageId: string) => {
    setFeedbackMessageId(messageId);
    setFeedbackRating(5);
    setFeedbackText('');
    setFeedbackMessage('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessageId || !activeConvId) return;

    try {
      const res = await fetch(`/api/dashboard/ai/chat/${activeConvId}/message/${feedbackMessageId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackRating, feedbackText })
      });
      if (res.ok) {
        setFeedbackMessage('Feedback rating submitted successfully.');
        setTimeout(() => {
          setShowFeedbackModal(false);
        }, 2000);
      }
    } catch (e) {}
  };

  const handleApproveRecommendation = async (id: string, title: string) => {
    setRecommendationsMessage('');
    try {
      const res = await fetch('/api/dashboard/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title })
      });
      if (res.ok) {
        setRecommendationsMessage(`Recommendation approved. Action task assigned.`);
        fetchRecommendations();
      }
    } catch (e) {}
  };

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setKnowledgeMessage('');
    try {
      const res = await fetch('/api/dashboard/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        setKnowledgeMessage('Document published successfully to the Credit Knowledge Base.');
        setNewDoc({ title: '', content: '', category: 'POLICY' });
        fetchKnowledgeDocs();
      }
    } catch (e) {}
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={32} style={{ color: 'var(--primary)' }} />
            AI Workspace & Assistant
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Interact with Proventa Specialized AI Agents to query portfolio insights and configure data connections.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'workspace', label: 'Conversational Workspace', icon: <MessageSquare size={16} /> },
          { id: 'recommendations', label: 'Proactive AI Insights', icon: <Sparkles size={16} /> },
          { id: 'knowledge', label: 'Enterprise Knowledge Base', icon: <BookOpen size={16} /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`btn ${activeSubTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Conversational Workspace */}
      {activeSubTab === 'workspace' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1.5fr 300px', gap: '1.5rem', height: 'calc(100vh - 240px)', minHeight: '500px' }}>
          
          {/* Left panel: Chat history archive */}
          <aside className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            <button onClick={handleStartNewChat} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Plus size={16} />
              New Copilot Chat
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, paddingLeft: '0.25rem' }}>CONVERSATION LOGS</div>
              {conversations.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', paddingLeft: '0.25rem' }}>No recent chats.</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    style={{
                      width: '100%', textAlign: 'left', background: c.id === activeConvId ? 'var(--secondary)' : 'none',
                      border: 'none', padding: '0.65rem 0.75rem', borderRadius: '4px', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: c.id === activeConvId ? 600 : 500,
                      color: c.id === activeConvId ? 'var(--primary)' : 'var(--muted)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <MessageSquare size={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  </button>
                ))
              )}
            </div>

            {/* Prompt templates list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, paddingLeft: '0.25rem' }}>PROMPT TEMPLATES</div>
              {PROMPT_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(tpl.prompt)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: '1px solid var(--border)',
                    padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--muted)',
                    display: 'flex', flexDirection: 'column', gap: '0.2rem'
                  }}
                >
                  <strong>{tpl.label}</strong>
                </button>
              ))}
            </div>
          </aside>

          {/* Center: Conversational chat box */}
          <main className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <strong>Proventa AI Copilot Sandbox</strong>
            </div>

            {/* Messages body stream */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', textAlign: 'center', color: 'var(--muted)' }}>
                  <Sparkles size={48} style={{ opacity: 0.5 }} />
                  <div>
                    <strong>Welcome to the AI Workspace Cockpit</strong>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', maxWidth: '350px' }}>Ask any question regarding company risk metrics, accounts receivables, or connection configurations.</p>
                  </div>
                  
                  {/* Suggested questions shortcuts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem', width: '100%', maxWidth: '500px' }}>
                    {SUGGESTED_PROMPTS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="btn btn-secondary"
                        style={{ padding: '0.65rem', fontSize: '0.75rem', whiteSpace: 'normal', textAlign: 'left', height: '100%', display: 'flex', alignItems: 'center' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      background: m.role === 'USER' ? 'var(--primary)' : 'var(--secondary)',
                      color: m.role === 'USER' ? 'white' : 'var(--foreground)',
                      border: m.role === 'USER' ? 'none' : '1px solid var(--border)'
                    }}>
                      {/* Markdown mock renderer details */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {m.content}
                      </div>

                      {/* Rating feedback button for assistant response */}
                      {m.role === 'ASSISTANT' && m.id !== 'temp_assistant' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--muted)' }}>Rate AI reply:</span>
                          <button 
                            onClick={() => handleOpenFeedback(m.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted)' }}
                          >
                            <Star size={12} />
                            Evaluate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loadingReply && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <div className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                  AI Copilot is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message bar */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Ask about portfolios, risk gearing, or sync statuses..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button onClick={() => handleSendMessage()} className="btn btn-primary" style={{ padding: '0.75rem' }}>
                <Send size={16} />
              </button>
            </div>
          </main>

          {/* Right panel: AI Explainability details */}
          <aside className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ROUTING AI AGENT</div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', display: 'block', marginTop: '0.25rem' }}>
                {activeAgent} Agent
              </strong>
            </div>

            {/* Confidence Meter */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>MODEL CONFIDENCE</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'Outfit', marginTop: '0.25rem' }}>
                {activeConfidence}%
              </div>
            </div>

            {/* Reasoning summary details */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>REASONING OUTLINE</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                {activeReasoning}
              </p>
            </div>

            {/* Citations metadata references */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.5rem' }}>DATA FEEDS CITATIONS</div>
              {activeCitations.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>No citations in active reply.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeCitations.map((c, idx) => (
                    <div key={idx} style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', background: 'var(--secondary)' }}>
                      <strong>{c.source}</strong>: {c.field} = {c.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* TAB CONTENT: Proactive AI Insights */}
      {activeSubTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {recommendationsMessage && (
            <div className="badge badge-success" style={{ padding: '0.75rem', display: 'block', textAlign: 'center' }}>
              {recommendationsMessage}
            </div>
          )}

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Active Risk & Operations Insights</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No active proactive recommendations.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} style={{
                    display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.25rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--background)'
                  }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{rec.title}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{rec.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--muted)' }}>Impact: <strong>{rec.impact}</strong></span>
                        <span style={{ color: 'var(--success)' }}>Confidence: <strong>{rec.confidenceScore}%</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveRecommendation(rec.id, rec.title)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Approve Action
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Knowledge Base */}
      {activeSubTab === 'knowledge' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          
          {/* Knowledge Catalog list */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Enterprise Knowledge Manuals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {knowledgeDocs.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No manuals uploaded yet.
                </div>
              ) : (
                knowledgeDocs.map((doc) => (
                  <div key={doc.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem' }}>{doc.title}</strong>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{doc.category}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                      {doc.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add knowledge document form */}
          <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Publish Document</h2>
            {knowledgeMessage && (
              <div className="badge badge-success" style={{ padding: '0.5rem', textAlign: 'center', display: 'block', marginBottom: '1rem' }}>
                {knowledgeMessage}
              </div>
            )}
            <form onSubmit={handleCreateKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Credit Policy 2026"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newDoc.category}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, category: e.target.value }))}
                  className="form-input"
                >
                  <option value="POLICY">Corporate Policy</option>
                  <option value="SOP">Standard Operating Procedure (SOP)</option>
                  <option value="MANUAL">User Reference Manual</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Content Payload *</label>
                <textarea
                  required
                  placeholder="Define credit parameters, default terms escalation paths, and risk appetites thresholds..."
                  value={newDoc.content}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, content: e.target.value }))}
                  className="form-input"
                  rows={6}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Publish Document Reference
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message feedback evaluation Modal */}
      {showFeedbackModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <button 
              onClick={() => setShowFeedbackModal(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Evaluate AI Reply</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Your feedback aligns future scoring model interpretations.</p>
            </div>

            {feedbackMessage && (
              <div className="badge badge-success" style={{ padding: '0.5rem', display: 'block', textAlign: 'center' }}>
                {feedbackMessage}
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Rating Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= feedbackRating ? 'var(--warning)' : 'var(--muted)' }}
                    >
                      <Star size={24} fill={star <= feedbackRating ? 'var(--warning)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Optional Comments</label>
                <textarea
                  placeholder="Suggestions or incorrect data flags..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="form-input"
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Submit Feedback Evaluation
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
