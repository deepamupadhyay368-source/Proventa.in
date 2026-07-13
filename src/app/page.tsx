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
  X,
  Layers,
  Globe,
  LineChart,
  BookOpen,
  Briefcase,
  Search,
  Award,
  FileText,
  Check,
  Lock,
  Settings,
  AlertTriangle
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
    { role: 'assistant', content: 'Hello! I am the **Proventa AI Advisor**. How can I help you check compliance or evaluate counterparty risk today?' }
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

  const builtForSectors = [
    { name: 'Banks & NBFCs', label: 'Institutional Lending', icon: <Building size={20} />, desc: 'Accelerate underwriting and evaluate loan counterparty risk instantly.' },
    { name: 'Manufacturers', label: 'Dealer Networks', icon: <Layers size={20} />, desc: 'Set automated credit terms and monitor payment delays across dealer rings.' },
    { name: 'Exporters', label: 'Global Trade', icon: <Globe size={20} />, desc: 'Scan international registries and hedge against cross-border default risks.' },
    { name: 'Wholesalers', label: 'Supply Chain', icon: <TrendingUp size={20} />, desc: 'Verify buyer creditworthiness before initiating major order dispatch lines.' },
    { name: 'Chartered Accountants', label: 'Audits & Taxation', icon: <Briefcase size={20} />, desc: 'Run automated GST return checks, statutory audits, and financial statements.' },
    { name: 'Company Secretaries', label: 'Corporate Filing', icon: <Settings size={20} />, desc: 'Automate Roc compliance schedules, registers, and resolution generation.' },
    { name: 'Legal Counsel', label: 'Litigation Scan', icon: <Scale size={20} />, desc: 'Audit active lawsuits and draft demand notices for slow-paying clients.' },
    { name: 'SMEs & FinTechs', label: 'Trade Limits', icon: <ShieldCheck size={20} />, desc: 'Access premium credit scores without expensive bureau subscription caps.' }
  ];

  const productModulesList = [
    { title: 'Universal Company Search', desc: 'Query GSTIN, PAN, CIN, or Director details instantly.', icon: <Search size={18} /> },
    { title: 'Credit Scoring Engine', desc: '0-1000 credit score assessment matching major global bureaus.', icon: <TrendingUp size={18} /> },
    { title: 'Risk Grading matrix', desc: 'Dynamic classification from AAA (Prime) to D (Insolvency).', icon: <Award size={18} /> },
    { title: 'Automated Credit Limits', desc: 'Recommended limit cap suggestions based on counterparty revenues.', icon: <Lock size={18} /> },
    { title: 'GST Compliance Audit', desc: 'Scan active filing standing and reconcile input tax credits.', icon: <FileText size={18} /> },
    { title: 'MCA ROC Postings', desc: 'Track filings history (AOC-4, MGT-7) and capital charges.', icon: <Building size={18} /> },
    { title: 'Director Networks Mapping', desc: 'Graph current board associations, resignations, and past companies.', icon: <Workflow size={18} /> },
    { title: 'Litigation Timeline Audit', desc: 'Scrape lawsuits, district filings, NCLT postings, and court dates.', icon: <Scale size={18} /> },
    { title: 'Payment Days Ageing', desc: 'Analyze DSO metrics and historical payment behavior calendars.', icon: <Activity size={18} /> },
    { title: 'Document Vault Parsing', desc: 'OCR parsing for bank statement PDF uploads & ledger sheets.', icon: <FileSpreadsheet size={18} /> },
    { title: 'AI Chartered Accountant', desc: 'Reconcile ledgers, compute TDS/TCS ratios, and prepare ITR filing.', icon: <Briefcase size={18} /> },
    { title: 'AI Company Secretary', desc: 'Board resolutions builder, compliance calendar, and registers.', icon: <Settings size={18} /> },
    { title: 'AI Legal Copilot', desc: 'Automated contract risk scanner and notice drafts generator.', icon: <ShieldCheck size={18} /> },
    { title: 'ERP Ingest Connectors', desc: 'Sync QuickBooks, Xero, Tally Prime, and Salesforce APIs.', icon: <Activity size={18} /> },
    { title: 'Continuous Monitoring', desc: 'Real-time alert notifications of counterparty rating adjustments.', icon: <AlertTriangle size={18} /> },
    { title: 'Bad Debt Forecasting', desc: 'Predict default indicators across portfolio segments.', icon: <LineChart size={18} /> },
    { title: 'Industry Benchmarking', desc: 'Compare payment performance against regional peer medians.', icon: <Layers size={18} /> },
    { title: 'Audit Trail Ledger', desc: 'Immutable logs, IP whitelists, and SOC-2 standard settings.', icon: <KeyRound size={18} /> },
    { title: 'White Label Suite', desc: 'Custom branding interface, primary themes, and domain routing.', icon: <Sparkles size={18} /> },
    { title: 'Developer API Portal', desc: 'Integrate scores and KYB scans directly into your product code.', icon: <Terminal size={18} /> },
    { title: 'Executive Overview', desc: 'Single-pane B2B cockpit showing total exposure & Bad Debt risks.', icon: <Layers size={18} /> }
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
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .hero-gradient-overlay {
          background: radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08) 0%, transparent 50%),
                      radial-gradient(circle at 10% 80%, rgba(139,92,246,0.05) 0%, transparent 50%);
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary) !important;
          box-shadow: 0 10px 30px rgba(37, 99, 235, 0.08) !important;
        }
        .trust-card:hover {
          border-color: var(--primary) !important;
          background: rgba(var(--primary-rgb), 0.02) !important;
        }
      `}</style>

      {/* Background gradients */}
      <div className="hero-gradient-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Floating Theme Switcher */}
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
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Navigation Header */}
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
        padding: '0 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div className="logo-icon" style={{ background: 'var(--primary)', color: '#ffffff', borderRadius: '8px' }}>P</div>
          <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>PROVENTA</span>
        </div>

        <nav className="desktop-only" style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover" onClick={() => setModalDetail({ title: 'Solutions', desc: 'Enterprise-grade credit scoring for trade counterparties. Reconcile GST returns, litigation indices, and board network mappings.', ctaText: 'Launch Assessment', link: '/login' })}>Solutions</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover" onClick={() => setModalDetail({ title: 'Industries', desc: 'Providing institutional credit intelligence for Banks, NBFCs, Manufacturers, Exporters, and Chartered Accountants.', ctaText: 'View Industries', link: '/waitlist' })}>Industries</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover" onClick={() => setModalDetail({ title: 'Platform & Modules', desc: 'Secure document vaults, custom AI agents, key rotation logs, and whitelist firewalls.', ctaText: 'Explore Platform', link: '/login' })}>Platform</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="nav-hover" onClick={() => setModalDetail({ title: 'Pricing', desc: 'Plans tailored to scaling search queries and automated workflow triggers.', ctaText: 'View Pricing', link: '/waitlist' })}>Pricing</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {auth ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem' }}>
              Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', padding: '0.6rem 1.2rem' }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '12px', padding: '0.6rem 1.4rem', background: 'var(--primary)' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Container */}
      <main style={{ flex: 1, zIndex: 10 }}>
        
        {/* Outcome-Driven Hero Section */}
        <section className="hero-grid" style={{ maxWidth: '1440px', margin: '0 auto', padding: '5rem 3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div className="hero-text-col">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '100px', padding: '0.35rem 1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <Sparkles size={14} />
              <span>Next-Gen Enterprise Credit Automation & KYC</span>
            </div>
            
            <h1 style={{
              fontSize: '4rem',
              lineHeight: '1.1',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Know who to trust before you sell.
            </h1>

            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.6',
              color: 'var(--muted)',
              marginBottom: '2.5rem',
              maxWidth: '650px'
            }}>
              Proventa combines corporate registries, court records, input tax indices, and banking statements to calculate instant credit risk scores and auto-approve trade limits.
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn btn-primary" style={{ textTransform: 'none', borderRadius: '14px', padding: '1rem 2.25rem', fontSize: '1rem', background: 'var(--primary)' }}>
                Start Free Trial
                <ArrowRight size={16} />
              </Link>
              
              <Link href="/book-demo" className="btn btn-secondary" style={{
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
                <span>Request Custom Demo</span>
              </Link>
            </div>
          </div>

          {/* Premium Floating Mockup Dashboard Card */}
          <div className="hero-visual-col animate-float" style={{ position: 'relative' }}>
            <div className="card" style={{
              borderRadius: '24px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-2xl)',
              background: 'var(--card)',
              padding: '2rem',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>Counterparty Assessment</div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{calcName}</h3>
                </div>
                <span className="badge badge-success" style={{ padding: '0.35rem 0.95rem', borderRadius: '8px', fontSize: '0.75rem' }}>✓ KYC VERIFIED</span>
              </div>

              {/* KPI Score Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Credit Score Engine</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span className="number-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{calcResult.score}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/900</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }}></span>
                    <span>Excellent standing</span>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Rating Grade</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>{calcResult.rating}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Low Risk</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                    Default Prob: <strong className="number-mono">{calcResult.risk}%</strong>
                  </div>
                </div>
              </div>

              {/* Exposure limit & terms details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: 'var(--background)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--muted)' }}>Approved Exposure Cap</span>
                  <span className="number-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{(calcResult.limit).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--muted)' }}>Optimal Payment Terms</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{calcResult.terms} Days</span>
                </div>
              </div>

              {/* AI Guidance details */}
              <div style={{ background: 'rgba(37,99,235,0.03)', border: '1px dashed var(--info-border)', borderRadius: '14px', padding: '1.25rem', display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                <Activity size={18} style={{ color: 'var(--info)', flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>AI Copilot Reasoning Guidance</h4>
                  <p style={{ color: 'var(--muted)', lineHeight: '1.5' }}>
                    Entity exhibits high annual revenue, active GST return filing history, and zero pending litigations. Recommended limit structure matches peak capacity index coefficients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built For Multi-Industry Trust Grid */}
        <section style={{ borderTop: '1px solid var(--border)', background: 'var(--card)', padding: '5rem 3rem' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                Engineered for High-Exposure Risk Officers
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
                From statutory audits to institutional underwriting, Proventa provides deep intelligence buffers.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {builtForSectors.map((sector, idx) => (
                <div 
                  key={idx} 
                  className="card trust-card" 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--background)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setModalDetail({ title: sector.name, desc: sector.desc, ctaText: 'Explore Module', link: '/login' })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}>
                      {sector.icon}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', display: 'block' }}>{sector.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{sector.label}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{sector.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Credit Simulator Tool */}
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
              Run an Instant Credit Assessment
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Simulate the risk matrix checks dynamically. Input credentials parameters to calculate values.
            </p>
          </div>

          <div className="dashboard-grid" style={{ alignItems: 'stretch', gap: '2.5rem' }}>
            {/* Input Form Card */}
            <div className="card col-6" style={{ padding: '2.5rem', borderRadius: '20px' }}>
              <form onSubmit={runInteractiveCalculator} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Counterparty Legal Name</label>
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
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Industry Classification</label>
                  <select 
                    className="form-input" 
                    value={calcIndustry} 
                    onChange={e => setCalcIndustry(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  >
                    <option value="Logistics">Logistics & Supply Chain</option>
                    <option value="Manufacturing">Heavy Manufacturing</option>
                    <option value="Wholesale">Wholesale Distribution</option>
                    <option value="Technology">SaaS & Technology</option>
                    <option value="Retail">E-commerce & Retail</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Annual Revenue (₹)</label>
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
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Active Civil Lawsuits / Court Disputes</label>
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
            <div className="col-6" style={{ display: 'flex' }}>
              <div className="card" style={{ width: '100%', background: 'var(--card)', padding: '2.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Automated Analysis Result</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Calculated Rating</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>{calcResult.rating}</span>
                      <span className="badge badge-success" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.7rem' }}>
                        Low Default
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Credit Score</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }} className="number-mono">
                      {calcResult.score}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Default Probability:</span>
                    <strong className="number-mono" style={{ color: 'var(--primary)' }}>{calcResult.risk}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Exposure Limit Recommended:</span>
                    <strong className="number-mono" style={{ color: 'var(--primary)' }}>₹{(calcResult.limit).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Invoice Gearing Terms:</span>
                    <strong style={{ color: 'var(--primary)' }}>{calcResult.terms} Days</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)', lineHeight: '1.4' }}>
                    This counterparty has been logged. Open a free trial account to run full registry downloads and export pdf reports.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 21-Module Product Directory */}
        <section style={{ background: 'var(--background)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '6rem 3rem' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                Enterprise Credit Intelligence Directory
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
                Explore all 21 key SaaS features designed to underwrite risk and enforce data transparency.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {productModulesList.map((module, idx) => (
                <div 
                  key={idx} 
                  className="card product-card" 
                  style={{ 
                    padding: '1.75rem', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--card)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem',
                    transition: 'all 0.25s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setModalDetail({ title: module.title, desc: module.desc, ctaText: 'Explore Platform', link: '/login' })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}>
                      {module.icon}
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{module.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{module.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Timeline */}
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              Step-by-Step Risk Ingestion Flow
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              How Proventa moves from raw connection hooks to continuous monitoring loops.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem', position: 'relative' }}>
            {[
              { num: '01', title: 'Secure Ingestion', desc: 'Sync API keys, link Tally Prime, or drag and drop bank reports PDF.' },
              { num: '02', title: 'AI OCR Extraction', desc: 'Read statements balances, invoice arrays, and verify legal registers details.' },
              { num: '03', title: 'Risk Score Engine', desc: 'Weight default indices and allocate AAA to D credit rating values.' },
              { num: '04', title: 'KYB & Lawsuit Audit', desc: 'Audit court registries and map inter-director board connections.' },
              { num: '05', title: 'Continuous Alerting', desc: 'Trigger webhook notifications on overdue invoice flags.' }
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(37,99,235,0.15)', fontFamily: 'Outfit, sans-serif' }}>{step.num}</span>
                  <div style={{ flex: 1, height: '2px', background: 'var(--border)', display: idx === 4 ? 'none' : 'block' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Grid Comparison */}
        <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '6rem 3rem' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                Transparent Pricing Plans
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Choose the model corresponding to your audit size and monthly scan volume.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[
                { name: 'Starter Sand', price: '₹0', term: 'forever free', desc: 'Sandbox environment for test queries.', features: ['5 Counterparty Scans', 'Basic KYC validation', 'Manual PDF upload', 'Email support'] },
                { name: 'Growth Pro', price: '₹2,999', term: 'per month', desc: 'Standard business ledger tracking.', features: ['50 Monthly Scans', 'ERP connectors (Tally/QBO)', 'Predictive DSO forecast', 'Priority support'] },
                { name: 'Business Scale', price: '₹14,999', term: 'per month', desc: 'Deep regulatory audits and graph maps.', features: ['250 Scans / Month', 'Director network graph audit', 'Active litigation crawler', '99.9% uptime SLA'] },
                { name: 'Unlimited Corporate', price: 'Custom Pricing', term: 'contracted annual', desc: 'Enterprise database isolation settings.', features: ['Unlimited Scans', 'Dedicated database tenancy', 'Custom DEK key rotations', '24/7 designated manager'] }
              ].map((plan, idx) => (
                <div key={idx} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--background)', borderRadius: '20px', border: idx === 1 ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{plan.name}</h3>
                    <div style={{ margin: '1rem 0 0.5rem 0' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{plan.price}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '4px' }}>/ {plan.term}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{plan.desc}</p>
                  </div>
                  
                  <div style={{ flex: 1, borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.map((feat, fidx) => (
                      <div key={fidx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                        <Check size={14} style={{ color: 'var(--success)' }} />
                        <span style={{ color: 'var(--muted)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/signup" className={`btn ${idx === 1 ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
              Everything you need to know about the platform security and architecture.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  borderColor: activeFaq === idx ? 'var(--primary)' : 'var(--border)',
                  background: 'var(--card)',
                  borderRadius: '14px'
                }}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{item.q}</h3>
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
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '1rem', lineHeight: '1.6' }}>
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
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{modalDetail.title}</h3>
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
