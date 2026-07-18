'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  KeyRound, 
  Sun, 
  Moon, 
  TrendingUp, 
  Building,
  ChevronDown,
  Terminal,
  Scale,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  Workflow,
  Sparkles,
  Play,
  MessageSquare,
  Send,
  X
} from 'lucide-react';

export default function RootLandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalDetail, setModalDetail] = useState<{ title: string; desc: string; ctaText: string; link: string } | null>(null);

  // Interactive ROI Calculator States
  const [calcName, setCalcName] = useState('Delta Shipping Ltd');
  const [calcIndustry, setCalcIndustry] = useState('Logistics');
  const [calcRevenue, setCalcRevenue] = useState(12000000);
  const [calcLitigations, setCalcLitigations] = useState(0);
  const [calcResult, setCalcResult] = useState<any>({
    score: 782,
    rating: 'AA',
    risk: 12,
    limit: 1800000,
    terms: 'Net-30'
  });

  // FAQ Accordion toggles
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Public AI Chatbot States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hello! I am the **Proventa AI Assistant**. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const sendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;
    setChatInput('');
    setChatLoading(true);

    const userMsg = { role: 'user', content: text };
    const nextMsgs = [...chatMessages, userMsg];
    setChatMessages(nextMsgs);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages([...nextMsgs, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages([...nextMsgs, { role: 'assistant', content: 'Sorry, I encountered an issue handling that request.' }]);
      }
    } catch (e) {
      setChatMessages([...nextMsgs, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuth(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const runInteractiveCalculator = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core Credit Assessment math simulation matching our creditEngine
    let baseScore = 650;
    
    if (calcRevenue > 50000000) baseScore += 80;
    else if (calcRevenue > 10000000) baseScore += 50;
    else if (calcRevenue > 1000000) baseScore += 20;
    else baseScore -= 30;

    if (calcLitigations > 3) baseScore -= 100;
    else if (calcLitigations > 0) baseScore -= 40;
    else baseScore += 20;

    const creditScore = Math.max(300, Math.min(900, baseScore));
    
    let creditRating = 'B';
    if (creditScore >= 800) creditRating = 'AAA';
    else if (creditScore >= 750) creditRating = 'AA';
    else if (creditScore >= 700) creditRating = 'A';
    else if (creditScore >= 650) creditRating = 'BBB';
    else if (creditScore >= 600) creditRating = 'BB';
    else if (creditScore >= 500) creditRating = 'B';
    else if (creditScore >= 400) creditRating = 'C';
    else creditRating = 'D';

    const riskScore = Math.max(5, Math.min(100, Math.round(((900 - creditScore) / 600) * 95 + 5)));
    
    let percentageMultiplier = 0.05;
    if (creditRating === 'AAA' || creditRating === 'AA') percentageMultiplier = 0.15;
    else if (creditRating === 'A' || creditRating === 'BBB') percentageMultiplier = 0.10;
    else if (creditRating === 'C' || creditRating === 'D') percentageMultiplier = 0.02;

    const recommendedLimit = Math.round(calcRevenue * percentageMultiplier);

    setCalcResult({
      score: creditScore,
      rating: creditRating,
      risk: riskScore,
      limit: recommendedLimit,
      terms: creditScore >= 700 ? 'Net-30' : creditScore >= 600 ? 'Net-15' : 'COD'
    });
  };

  const faqItems = [
    {
      q: 'How does Proventa verify corporate identities (KYB)?',
      a: 'Proventa automatically connects to government registries to retrieve and cross-reference active Corporate Identification Numbers (CIN), Goods and Services Tax Identification Numbers (GSTIN), and Permanent Account Numbers (PAN). This ensures that the entity exists, is in active standing, and matches registration addresses.'
    },
    {
      q: 'What data points drive the AI Credit Scoring algorithm?',
      a: 'The assessment balances multiple parameters: operational financial turnover scaling, headcount capacity index, regulatory compliance standing (active GST/PAN), and historical civil disputes or insolvency filings. It runs calculations to produce an index score (300 to 900) aligned with major global credit bureaus.'
    },
    {
      q: 'How does the automated Litigation and Dispute scan work?',
      a: 'Proventa queries national civil tribunals and district courts for litigation filings matching the target company name or directors. It flags the filing date, court venue, amount disputed, and case status, calculating how these contingent liabilities impact company liquidity and default risk.'
    },
    {
      q: 'Can Proventa integrate with our existing ERP system?',
      a: 'Absolutely. Developers can generate API keys directly in their dashboard to query credit scores, retrieve due diligence reports, and automate trade credit decisions. Code snippets are provided in cURL, Python, and Node.js for rapid integration.'
    },
    {
      q: 'What security standards are implemented on the platform?',
      a: 'Proventa is built on a Zero-Trust architecture. All data transfers are encrypted in transit via SSL/TLS and at rest using AES-256 standards. Our document vault automatically runs malware checks on uploads, and we provide detailed, immutable audit log ledgers that align with SOC 2 trust principles.'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--background)',
      color: 'var(--foreground)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Subtle Financial Node network background effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '600px',
        opacity: 0.35,
        backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px), radial-gradient(rgba(37,99,235,0.03) 2px, transparent 2px)`,
        backgroundSize: '30px 30px, 60px 60px',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Floating Theme Button */}
      <button 
        onClick={toggleTheme}
        className="theme-switch"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          padding: '0.8rem',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Sticky Header Navigation */}
      <header className="top-nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        height: '80px',
        borderBottom: '1px solid var(--border)',
        background: theme === 'dark' ? 'rgba(6, 10, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '0 3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', width: '100%', justifyContent: 'space-between' }}>
          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div className="logo-icon" style={{ background: 'var(--primary)', color: '#ffffff', borderRadius: '8px' }}>P</div>
            <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>PROVENTA</span>
          </div>

          {/* Desktop Navigation Menu Links */}
          <nav className="desktop-only" style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Solutions</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Industries</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Platform</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Pricing</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Resources</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">About</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover">Contact</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {auth ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem' }}>
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', padding: '0.6rem 1.2rem' }}>
                  Sign In
                </Link>
                <Link href="/waitlist" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem', background: 'var(--primary)' }}>
                  Join Waitlist
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main style={{ flex: 1, zIndex: 10 }}>
        {/* Full-width premium Hero Section */}
        <section className="hero-grid" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Left Column Text */}
          <div className="hero-text-col">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: '100px', padding: '0.35rem 1rem', color: 'var(--info)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <Sparkles size={14} />
              <span>Next-Gen Enterprise Credit Automation</span>
            </div>
            
            <h1 style={{
              fontSize: '3.6rem',
              lineHeight: '1.15',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem'
            }}>
              AI Credit Intelligence for Modern Businesses
            </h1>

            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.6',
              color: 'var(--muted)',
              marginBottom: '2.5rem',
              maxWidth: '600px'
            }}>
              Transform financial data into actionable credit decisions with AI-powered risk analysis, cash flow intelligence, financial insights, and enterprise automation.
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/waitlist" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '14px', padding: '1rem 2.25rem', fontSize: '1rem', background: 'var(--primary)' }}>
                Join Priority Waitlist
                <ArrowRight size={16} />
              </Link>
              
              <button className="btn btn-secondary" style={{
                textTransform: 'none',
                borderRadius: '14px',
                padding: '1rem 2.25rem',
                fontSize: '1rem',
                background: 'transparent',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Play size={16} style={{ fill: 'currentColor' }} />
                <span>Watch Platform</span>
              </button>
            </div>
          </div>

          {/* Right Column: Premium Dashboard Floating Mockup */}
          <div className="hero-visual-col" style={{ position: 'relative' }}>
            <div className="card" style={{
              borderRadius: '20px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--card)',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              {/* Mockup Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>Counterparty Assessment</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{calcName}</h3>
                </div>
                <span className="badge badge-success" style={{ padding: '0.3rem 0.8rem', borderRadius: '8px' }}>Active</span>
              </div>

              {/* KPI Score Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Credit Health Score</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span className="number-mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{calcResult.score}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/900</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }}></span>
                    <span>Excellent Standing</span>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Assessment</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>{calcResult.rating}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Low Risk</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    Index probability of default: <strong className="number-mono">{calcResult.risk}%</strong>
                  </div>
                </div>
              </div>

              {/* Cash Flow Limit Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Recommended Credit Limit</span>
                  <span className="number-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>₹{(calcResult.limit / 100000).toFixed(1)} L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Payment Terms</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{calcResult.terms}</span>
                </div>
              </div>

              {/* AI Recommendations Panel */}
              <div style={{ background: 'rgba(37,99,235,0.03)', border: '1px dashed var(--info-border)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                <Activity size={18} style={{ color: 'var(--info)', flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>AI Insight Guidance</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                    Entity exhibits high cash flow margins and low litigation exposure. Trade limit recommendation adjusted to ₹{(calcResult.limit).toLocaleString('en-IN')} withNet terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Trust Indicator Banner Section */}
        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--card)', padding: '2.5rem 0' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 3rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Trusted By Enterprise Risk Officers In</span>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap', filter: 'grayscale(1) opacity(0.6)' }} className="logo-filter">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}><Building size={16} /> BANKS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}><Building size={16} /> NBFCs</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}><Building size={16} /> DISTRIBUTORS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}><Building size={16} /> EXPORTERS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}><Building size={16} /> MANUFACTURERS</span>
            </div>
          </div>
        </section>

        {/* Interactive Credit Assessment Tool Module */}
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Run an Instant Credit Assessment
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Simulate the credit decision engine workflow directly. Enter company details to calculate risk.
            </p>
          </div>

          <div className="dashboard-grid" style={{ alignItems: 'start', gap: '2rem' }}>
            {/* Input Form Card */}
            <div className="card col-6" style={{ padding: '2.5rem' }}>
              <form onSubmit={runInteractiveCalculator}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={calcName} 
                    onChange={e => setCalcName(e.target.value)} 
                    required
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industry Classification</label>
                  <select 
                    className="form-input" 
                    value={calcIndustry} 
                    onChange={e => setCalcIndustry(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  >
                    <option value="Logistics">Logistics & Supply Chain</option>
                    <option value="Manufacturing">Heavy Manufacturing</option>
                    <option value="Distributor">Wholesale Distribution</option>
                    <option value="Technology">SaaS & Technology</option>
                    <option value="Retail">E-commerce & Retail</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Turnover (₹)</label>
                  <select 
                    className="form-input" 
                    value={calcRevenue} 
                    onChange={e => setCalcRevenue(Number(e.target.value))}
                    style={{ borderRadius: '12px' }}
                  >
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={12000000}>₹1.2 Crores</option>
                    <option value={60000000}>₹6 Crores</option>
                    <option value={200000000}>₹20 Crores</option>
                    <option value={1000000000}>₹100 Crores</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Active Civil Litigations / Disputes</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0" 
                    max="20" 
                    value={calcLitigations} 
                    onChange={e => setCalcLitigations(Number(e.target.value))}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', textTransform: 'none', borderRadius: '12px', padding: '1rem', marginTop: '1rem', background: 'var(--primary)' }}
                >
                  Analyze Risk Matrix
                </button>
              </form>
            </div>

            {/* Assessment Score Results Output View */}
            <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card" style={{ background: 'var(--card)', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>Automated Analysis Result</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Calculated Credit Rating</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--secondary)' }}>{calcResult.rating}</span>
                      <span className="badge badge-success" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.7rem' }}>
                        Low Risk
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Score Metrics</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary)' }} className="number-mono">
                      {calcResult.score}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Empirical Default Probability:</span>
                    <strong className="number-mono" style={{ color: 'var(--primary)' }}>{calcResult.risk}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Approved Exposure Limit:</span>
                    <strong className="number-mono" style={{ color: 'var(--primary)' }}>₹{(calcResult.limit).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Optimal Invoice Terms:</span>
                    <strong style={{ color: 'var(--primary)' }}>{calcResult.terms}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                    This company has been successfully logged inside the credit intelligence system. You can generate a comprehensive PDF Credit Report by onboarding this account inside the portal.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Pillars Section */}
        <section style={{ background: 'var(--background)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '6rem 3rem' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                End-to-End Enterprise credit Command Center
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Automate due diligence checks and credit rating calculations using multi-source digital endpoints.
              </p>
            </div>

            <div className="dashboard-grid" style={{ gap: '2rem' }}>
              <div className="card col-4" style={{ padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)', marginBottom: '1.5rem', paddingLeft: '0.85rem' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>AI Data Lake & Warehouse</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Centralize raw financial statements, tax records, and bank data. Leverage version-controlled feature stores optimized for algorithmic trade credit assessment.
                </p>
              </div>

              <div className="card col-4" style={{ padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)', marginBottom: '1.5rem', paddingLeft: '0.85rem' }}>
                  <Scale size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>Enterprise Data Governance</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Assign data stewards, classify sensitive documents, configure key rotation policies, and manage approval workflows for exposure overrides securely.
                </p>
              </div>

              <div className="card col-4" style={{ padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)', marginBottom: '1.5rem', paddingLeft: '0.85rem' }}>
                  <Workflow size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>AI Automation Engines</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Automate notifications and workflows using event triggers. Let Proventa automatically message collections agents or warn of risk fluctuations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
              Everything you need to know about the platform security and architecture.
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  borderColor: activeFaq === idx ? 'var(--primary)' : 'var(--border)',
                  background: 'var(--card)'
                }}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{item.q}</h3>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.2s',
                      color: 'var(--muted)'
                    }} 
                  />
                </div>
                {activeFaq === idx && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '1rem', lineHeight: '1.6' }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Premium B2B Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)', padding: '4rem 3rem' }}>
        <div className="dashboard-grid" style={{ maxWidth: '1440px', margin: '0 auto', gap: '2rem', marginBottom: '3rem' }}>
          <div className="col-4">
            <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
              <div className="logo-icon" style={{ background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>P</div>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.3rem' }}>PROVENTA</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
              Proventa is a complete AI Credit Intelligence and risk decisioning platform for financial institutions and modern enterprise finance teams.
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>© {new Date().getFullYear()} Proventa. All rights reserved.</span>
          </div>

          <div className="col-3">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Solutions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Credit Intelligence', desc: 'Enterprise-grade credit scoring for trade counterparties. Upload PAN/GST credentials, scan registry filings, and retrieve real-time ratings in seconds.', ctaText: 'Launch Assessment', link: '/login' })}>Credit Intelligence</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Risk Management', desc: 'Configure trigger events, set automated credit limits, and define notification warnings. Proventa flags payment delinquencies before they affect your balance sheet.', ctaText: 'Join Waitlist', link: '/waitlist' })}>Risk Management</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Cash Flow Analytics', desc: 'Automated bank statement parsing. Track credit-to-debit ratios, average ledger balances, and cash runaways to forecast counterparties liquidity.', ctaText: 'Analyze Statements', link: '/login' })}>Cash Flow Analytics</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Compliance Scan', desc: 'Scan corporate legal filings across district and high courts. Verify GST registration active status and run director KYC background checks.', ctaText: 'Verify Now', link: '/login' })}>Compliance Scan</span>
            </div>
          </div>

          <div className="col-2">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Industries</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Banking & NBFCs', desc: 'Underwrite trade credit lines faster. Integrate algorithmic credit scoring directly into loan origination systems to reduce NPA defaults.', ctaText: 'Request Institutional Access', link: '/waitlist' })}>Banking & NBFCs</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Manufacturers Solutions', desc: 'Protect distributor chains. Set automatic credit thresholds and receive instant default warnings on overdue dealer accounts.', ctaText: 'Protect Distributor Chain', link: '/waitlist' })}>Manufacturers</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Exporters Coverage', desc: 'Manage global buyer risk. Track cross-border counterparties default matrices and insolvency registry filings in real-time.', ctaText: 'Begin Ingestion', link: '/login' })}>Exporters</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'SMEs & Fintechs Tools', desc: 'Level the playing field. Access institutional-grade credit intelligence without expensive credit bureau subscriptions or minimum spend requirements.', ctaText: 'Start Free Assessment', link: '/waitlist' })}>SMEs & Fintechs</span>
            </div>
          </div>

          <div className="col-3">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Security</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Privacy Policy', desc: 'Zero data-sharing guarantee. All business tax data and ledger statements are locked under per-organization envelope encryption keys (DEK).', ctaText: 'View Consent Matrix', link: '/login' })}>Privacy Policy</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Security Center', desc: 'SOC-2 certified framework. Direct AES-256-GCM data encryption, automated audit trails, and Strict HSTS TLS 1.3 transit security.', ctaText: 'Review Security Controls', link: '/login' })}>Security Center</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'SOC 2 Compliance Standards', desc: 'Fully compliant with SOC-2 security protocols. Proventa undergoes annual external penetration audits and continuous security controls monitoring.', ctaText: 'Request Compliance Report', link: '/waitlist' })}>SOC 2 Compliance</span>
              <span className="footer-interactive-link" style={{ cursor: 'pointer' }} onClick={() => setModalDetail({ title: 'Terms of Service', desc: 'B2B SaaS subscription parameters. Complete SLA uptime guarantees, database safety commitments, and tenant data isolation rules.', ctaText: 'Acknowledge Terms', link: '/waitlist' })}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Button */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="chat-toggle"
        style={{
          position: 'fixed',
          bottom: '95px',
          right: '25px',
          background: 'var(--primary)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1rem',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        aria-label="Toggle AI Advisor"
      >
        <MessageSquare size={22} />
      </button>

      {/* Floating Chatbot Window */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '165px',
          right: '25px',
          width: '380px',
          height: '500px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-2xl)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 700 }}>Proventa AI Advisor</span>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'var(--background)'
          }}>
            {chatMessages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--card)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--foreground)',
                  padding: '0.85rem 1rem',
                  borderRadius: '16px',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.content}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div className="animate-spin" style={{ width: '10px', height: '10px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                Thinking...
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderTop: '1px solid var(--border)',
            background: 'var(--card)',
            scrollbarWidth: 'none'
          }}>
            {[
              { label: 'Core Features', query: 'What are the main features of Proventa?' },
              { label: 'Pricing Plans', query: 'What are the pricing options?' },
              { label: 'Data Security', query: 'Explain data security standards.' }
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => sendChatMessage(shortcut.query)}
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}
              >
                {shortcut.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--card)'
          }}>
            <input 
              type="text"
              placeholder="Ask about Proventa..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                background: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none'
              }}
            />
            <button 
              onClick={() => sendChatMessage()}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.6rem 0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Details Modal */}
      {modalDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(11, 31, 58, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-2xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>{modalDetail.title}</h3>
              <button 
                onClick={() => setModalDetail(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: '1.6' }}>{modalDetail.desc}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setModalDetail(null); router.push(modalDetail.link); }} className="btn btn-primary" style={{ flex: 1 }}>
                {modalDetail.ctaText}
              </button>
              <button onClick={() => setModalDetail(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
