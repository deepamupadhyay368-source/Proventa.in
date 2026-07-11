'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  KeyRound, 
  Sun, 
  Moon, 
  TrendingUp, 
  Scale, 
  CheckCircle,
  Building,
  ChevronDown,
  Terminal,
  Calculator,
  Fingerprint,
  Globe2
} from 'lucide-react';

export default function RootLandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Interactive ROI Calculator States
  const [calcName, setCalcName] = useState('Delta Shipping Ltd');
  const [calcIndustry, setCalcIndustry] = useState('Logistics');
  const [calcRevenue, setCalcRevenue] = useState(12000000);
  const [calcLitigations, setCalcLitigations] = useState(0);
  const [calcResult, setCalcResult] = useState<any>(null);

  // FAQ Accordion toggles
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
      {/* Visual background grids */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 75%)',
        top: '-20%',
        left: '-20%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 75%)',
        bottom: '-10%',
        right: '-20%',
        zIndex: 0
      }} />

      {/* Floating Theme Button */}
      <button 
        onClick={toggleTheme}
        className="theme-switch"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
          padding: '0.6rem',
          zIndex: 1000
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Top Banner Header */}
      <header className="top-nav" style={{ background: 'transparent', borderBottom: 'none', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="logo-container">
          <div className="logo-icon">P</div>
          PROVENTA
        </div>
        <div>
          {auth ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Enter Platform
              <ArrowRight size={14} />
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/login" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                Start Free Trial
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(37, 99, 235, 0.08)',
          color: 'var(--primary)',
          padding: '0.5rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          border: '1px solid rgba(37, 99, 235, 0.15)',
          marginBottom: '2rem'
        }}>
          <Sparkles size={14} />
          Enterprise AI Credit Decision Engine
        </div>

        <h1 style={{
          fontSize: '4rem',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          maxWidth: '900px',
          margin: '0 auto 1.5rem auto'
        }}>
          Modern B2B Credit Intelligence & KYB Verification
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--muted)',
          lineHeight: '1.6',
          maxWidth: '750px',
          margin: '0 auto 3rem auto'
        }}>
          Proventa accelerates credit checks, automates trade finance approvals, and checks corporate tax and litigation registries.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {auth ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}>
              Open Dashboard Overview
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/signup" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}>
                Start Risk Analysis
                <ArrowRight size={18} />
              </Link>
              <Link href="/login/google" className="btn btn-secondary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Simulated Google colored G logo */}
                <span style={{ fontWeight: 'bold', color: '#4285F4' }}>G</span> Sign up with Google
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Main Pillars Section: What does Proventa Do? */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Complete B2B Credit Assurance</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Four integrated modules built for credit managers, insurers, and finance teams</p>
          </div>

          <div className="dashboard-grid">
            {/* Pillar 1: AI Credit Scoring */}
            <div className="card col-3" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.75rem' }}>AI Credit Scoring</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                Generates a credit score (300-900) based on operational liquidity, debt-to-equity leverage, headcount capacity, and payment delays history.
              </p>
            </div>

            {/* Pillar 2: Corporate KYB verification */}
            <div className="card col-3" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(6, 182, 212, 0.08)', color: 'var(--info)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Building size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.75rem' }}>KYB Registries Verification</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                Instant confirmation of business legal standing, active directors, incorporation dates, and tax identifications including **CIN**, **GSTIN**, and **PAN**.
              </p>
            </div>

            {/* Pillar 3: Court Disputes Monitor */}
            <div className="card col-3" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Scale size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.75rem' }}>Litigation Scanning</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                Automated sweeps across district and state tribunals to scan for outstanding civil claims, insolvency filings, or regulatory warning indicators.
              </p>
            </div>

            {/* Pillar 4: Developer Rest API */}
            <div className="card col-3" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <KeyRound size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.75rem' }}>API Integrations</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                Integrate automated credit decision limits and trade approvals directly into your **SAP**, **Oracle NetSuite**, or **QuickBooks** ERP engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Simulator / ROI Calculator */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem', zIndex: 1 }}>
        <div className="dashboard-grid" style={{ alignItems: 'center' }}>
          {/* Left Text */}
          <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Calculator size={18} />
              <span>INTERACTIVE SANDBOX</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800, lineHeight: 1.1 }}>
              Test Proventa's AI Scoring Formula Instantly
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>
              Enter a counterparty's annual revenue turnover and known court disputes to see how the system calculates credit scores, determines grades, and advises on recommended trade finance limits.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Transparent mathematical logic mapping.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Adjusts multiplier coefficients by risk.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Zero placeholders. Full operational sandbox.</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Form and Dial */}
          <div className="col-6">
            <div className="card" style={{ padding: '2.5rem' }}>
              <form onSubmit={runInteractiveCalculator} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input type="text" className="form-input" value={calcName} onChange={(e) => setCalcName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry Classification</label>
                    <select className="form-input" value={calcIndustry} onChange={(e) => setCalcIndustry(e.target.value)}>
                      <option value="Logistics">Logistics</option>
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Wholesale Trade">Wholesale Trade</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Annual Revenue (USD)</label>
                    <input type="number" className="form-input" value={calcRevenue} onChange={(e) => setCalcRevenue(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Court Lawsuits / Disputes</label>
                    <input type="number" min={0} className="form-input" value={calcLitigations} onChange={(e) => setCalcLitigations(Number(e.target.value))} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Compute Risk Score
                </button>
              </form>

              {/* Calculator Output */}
              {calcResult && (
                <div className="animate-fade-in" style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Calculated Score</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{calcResult.score}</span>
                    <span className="badge badge-success" style={{
                      marginTop: '0.25rem',
                      background: calcResult.score > 700 ? 'var(--success-bg)' : calcResult.score > 600 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                      color: calcResult.score > 700 ? 'var(--success)' : calcResult.score > 600 ? 'var(--warning)' : 'var(--danger)'
                    }}>
                      Rating: {calcResult.rating}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Risk Factor:</span>
                      <strong>{calcResult.risk}% Default Prob</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Recommended Limit:</span>
                      <strong style={{ color: 'var(--success)' }}>${calcResult.limit.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Standard Terms:</span>
                      <strong>{calcResult.terms} Account</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Zero Trust compliance specifications */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800 }}>SOC 2 Compliance & Security Layer</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Zero Trust isolation patterns protecting critical corporate financial profiles</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ShieldCheck size={28} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Data Encryption</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                  All uploaded registry certificates and balance sheet records are stored inside AES-256 standard vaults.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Fingerprint size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>SSO & RBAC Permissions</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                  Role-based checks restrict auditor access. Single Sign-on integration secures logins via corporate Google profiles.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Activity size={28} style={{ color: 'var(--info)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Immutable Activity Logs</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                  Every API key execution, subscription upgrade, or company audit leaves an immutable, non-deletable audit log.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Plan */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Simple, Scalable Licensing</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Select the correct capacity threshold for your finance board</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { name: 'Developer Free', price: '$0', desc: 'Best for local testing. Access up to 5 credit evaluations and sandbox APIs.', link: '/signup' },
            { name: 'Enterprise Pro', price: '$499', desc: 'Up to 100 counterparties. Includes daily litigation sweeps and unlimited API tokens.', link: '/signup' },
            { name: 'Unlimited Scale', price: '$2,499', desc: 'Unlimited counterparty portfolios, custom risk parameters, and dedicated support.', link: '/signup' },
          ].map((plan, pidx) => (
            <div key={pidx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'Outfit', fontWeight: 700 }}>{plan.name}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
                  {plan.price} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--muted)' }}>/ month</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5', flex: 1 }}>{plan.desc}</p>
              <Link href={plan.link} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Common questions about corporate credits checks and registries access</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--background)',
                    overflow: 'hidden'
                  }}
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--foreground)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--muted)'
                    }} />
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 1.5rem 1.25rem 1.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--muted)',
                      lineHeight: '1.6'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.85rem',
        color: 'var(--muted)',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        © {new Date().getFullYear()} Proventa Systems Inc. Grounded in SOC-2 zero trust security standards.
      </footer>
    </div>
  );
}
