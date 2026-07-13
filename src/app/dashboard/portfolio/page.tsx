'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Building, 
  TrendingUp, 
  Scale, 
  Download, 
  FileText, 
  Search,
  Filter,
  Bookmark,
  Clock,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  Settings,
  Calendar,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  User,
  Info
} from 'lucide-react';

interface CompanyDetails {
  id: string;
  name: string;
  tradeName: string | null;
  cin: string | null;
  gstin: string | null;
  pan: string | null;
  legalType: string;
  industry: string;
  subIndustry: string | null;
  incorporationDate: string | null;
  natureOfBusiness: string | null;
  regAddress: string;
  opAddress: string | null;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  employeeCount: number | null;
  annualRevenue: number | null;
  annualTurnover: number | null;
  productsServices: string | null;
  directors: string | null;
  partners: string | null;
  authSignatory: string | null;
  assessments: Array<{
    creditScore: number;
    creditRating: string;
    riskScore: number;
    recommendedLimit: number;
    assessmentData: string;
  }>;
  litigations: Array<{
    id: string;
    caseNumber: string;
    court: string;
    status: string;
    amountDisputed: number;
    description: string;
    filingDate: string;
  }>;
}

export default function PortfolioAnalytics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');

  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Discovery States
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('SCORE_DESC');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Active Dossier Tab
  const [activeTab, setActiveTab] = useState<'kyc' | 'credit' | 'gst_mca' | 'directors' | 'litigation' | 'payment'>('kyc');

  // Interactive Graph Hover State
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    // Load watchlist and recent searches from localStorage
    const savedWatchlist = localStorage.getItem('proventa_watchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

    const savedRecent = localStorage.getItem('proventa_recent_searches');
    if (savedRecent) setRecentSearches(JSON.parse(savedRecent));

    // Fetch all companies
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/dashboard/summary');
        if (!res.ok) throw new Error('Failed to load summary');
        const summaryData = await res.json();
        
        const compList = summaryData.portfolioCompanies || [];
        const ownComp = summaryData.primaryCompany;
        
        const allComps: CompanyDetails[] = [];
        if (ownComp) {
          const detailRes = await fetch(`/api/company/${ownComp.id}`);
          if (detailRes.ok) {
            const dData = await detailRes.json();
            allComps.push(dData.company);
          }
        }

        for (const c of compList) {
          const detailRes = await fetch(`/api/company/${c.id}`);
          if (detailRes.ok) {
            const dData = await detailRes.json();
            allComps.push(dData.company);
          }
        }

        setCompanies(allComps);

        // Select company based on param or default
        if (allComps.length > 0) {
          const active = allComps.find(x => x.id === targetId) || allComps[0];
          setSelectedCompany(active);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [targetId]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const comp = companies.find(c => c.id === e.target.value);
    if (comp) {
      setSelectedCompany(comp);
      router.push(`/dashboard/portfolio?id=${comp.id}`);
    }
  };

  const handleSelectCompanyDirect = (comp: CompanyDetails) => {
    setSelectedCompany(comp);
    router.push(`/dashboard/portfolio?id=${comp.id}`);
    
    // Save search keyword if relevant
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('proventa_recent_searches', JSON.stringify(updated));
    }
  };

  const toggleWatchlist = (id: string) => {
    let updated: string[];
    if (watchlist.includes(id)) {
      updated = watchlist.filter(x => x !== id);
    } else {
      updated = [...watchlist, id];
    }
    setWatchlist(updated);
    localStorage.setItem('proventa_watchlist', JSON.stringify(updated));
  };

  // Filter & Sort math
  const filteredCompanies = companies.filter(c => {
    const textMatch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tradeName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.cin?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.gstin?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.pan?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.directors?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const industryMatch = industryFilter === 'ALL' || c.industry === industryFilter;
    
    return textMatch && industryMatch;
  }).sort((a, b) => {
    const scoreA = a.assessments[0]?.creditScore || 500;
    const scoreB = b.assessments[0]?.creditScore || 500;
    const limitA = a.assessments[0]?.recommendedLimit || 0;
    const limitB = b.assessments[0]?.recommendedLimit || 0;

    if (sortBy === 'SCORE_DESC') return scoreB - scoreA;
    if (sortBy === 'SCORE_ASC') return scoreA - scoreB;
    if (sortBy === 'LIMIT_DESC') return limitB - limitA;
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    return 0;
  });

  const exportCsv = () => {
    if (!selectedCompany) return;
    const assess = selectedCompany.assessments[0];
    const headers = 'Field,Value\n';
    const rows = [
      `Company Name,${selectedCompany.name}`,
      `Industry,${selectedCompany.industry}`,
      `Credit Rating,${assess?.creditRating || 'B'}`,
      `Credit Score,${assess?.creditScore || 500}`,
      `Risk Score,${assess?.riskScore || 50}%`,
      `Recommended Limit,${assess?.recommendedLimit || 0}`,
      `Annual Revenue,${selectedCompany.annualRevenue || 0}`,
      `Active Litigations,${selectedCompany.litigations.length}`,
      `CIN,${selectedCompany.cin || ''}`,
      `GSTIN,${selectedCompany.gstin || ''}`,
      `PAN,${selectedCompany.pan || ''}`
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedCompany.name.replace(/\s+/g, '_')}_Credit_Report.csv`);
    a.click();
  };

  const printPdf = () => {
    if (!selectedCompany) return;
    window.open(`/api/dashboard/reports?export=true&companyId=${selectedCompany.id}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  const assess = selectedCompany?.assessments[0];
  const assessmentData = assess ? JSON.parse(assess.assessmentData) : null;
  const rating = assess?.creditRating || 'B';
  const score = assess?.creditScore || 500;
  const limit = assess?.recommendedLimit || 0;
  const risk = assess?.riskScore || 50;

  // Extract unique industries for filter dropdown
  const industries = Array.from(new Set(companies.map(c => c.industry)));

  // Simulated ROC Filings for GST/MCA tab
  const mcaFilings = [
    { form: 'Form AOC-4 (Financial Statements)', period: 'FY 2024-25', status: 'FILED', date: '30-Oct-2025' },
    { form: 'Form MGT-7 (Annual Return)', period: 'FY 2024-25', status: 'FILED', date: '28-Nov-2025' },
    { form: 'Form DIR-3 KYC', period: 'AY 2025-26', status: 'PENDING', date: 'Upcoming (Due: 30-Sep)' },
    { form: 'Form MSME-1 (Oustanding Dues)', period: 'H1 FY 2025', status: 'FILED', date: '25-Apr-2025' }
  ];

  // Simulated GST Filings for GST/MCA tab
  const gstFilings = [
    { form: 'GSTR-1 (Sales Ledger)', period: 'June 2026', status: 'FILED', date: '10-Jul-2026' },
    { form: 'GSTR-3B (Net Summary)', period: 'June 2026', status: 'FILED', date: '18-Jul-2026' },
    { form: 'GSTR-1 (Sales Ledger)', period: 'May 2026', status: 'FILED', date: '11-Jun-2026' },
    { form: 'GSTR-3B (Net Summary)', period: 'May 2026', status: 'DELAYED', date: 'Filed: 24-Jun (Late)' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      
      {/* Global Search and filtration section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} />
          Global Corporate Registry Search & Discovery
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Company Name, GSTIN, PAN, CIN, or Director Name..." 
              className="form-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', margin: 0 }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select className="form-input" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={{ width: 'auto', margin: 0 }}>
              <option value="ALL">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 'auto', margin: 0 }}>
              <option value="SCORE_DESC">Credit Score: High to Low</option>
              <option value="SCORE_ASC">Credit Score: Low to High</option>
              <option value="LIMIT_DESC">Credit Limit: High to Low</option>
              <option value="NAME_ASC">Company Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Watchlist/Recent searches section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={12} />
              <span>Recent Searches:</span>
              {recentSearches.map((s, idx) => (
                <span 
                  key={idx} 
                  onClick={() => setSearchQuery(s)}
                  style={{ background: 'var(--secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--foreground)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Search results list */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '680px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Counterparty Registry ({filteredCompanies.length})
            </h4>
            
            {filteredCompanies.map(c => {
              const isSelected = selectedCompany?.id === c.id;
              const isWatch = watchlist.includes(c.id);
              const scoreVal = c.assessments[0]?.creditScore || 500;
              const ratingVal = c.assessments[0]?.creditRating || 'B';

              return (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCompanyDirect(c)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.04)' : 'var(--background)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'inherit', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {c.name}
                    </strong>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(c.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isWatch ? 'var(--warning)' : 'var(--muted)' }}
                    >
                      <Bookmark size={14} fill={isWatch ? 'var(--warning)' : 'none'} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span>{c.industry}</span>
                    <span style={{
                      fontWeight: 700,
                      color: scoreVal >= 700 ? 'var(--success)' : scoreVal >= 600 ? 'var(--warning)' : 'var(--danger)'
                    }}>
                      {ratingVal} ({scoreVal})
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCompanies.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No counterparties match query.</span>
            )}
          </div>
        </div>

        {/* Right Side: Active Company Dossier Cockpit */}
        {selectedCompany && (
          <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Identity banner */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{selectedCompany.name}</h2>
                  {watchlist.includes(selectedCompany.id) && (
                    <Bookmark size={18} fill="var(--warning)" stroke="var(--warning)" title="Watchlist item" />
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {selectedCompany.legalType.replace(/_/g, ' ')} • {selectedCompany.industry} • Location: {selectedCompany.city}, {selectedCompany.state}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportCsv} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={printPdf} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Print Dossier
                </button>
              </div>
            </div>

            {/* Dossier Tabs Row */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {[
                { id: 'kyc', label: 'KYC Overview', icon: <Building size={14} /> },
                { id: 'credit', label: 'Credit & Limits', icon: <TrendingUp size={14} /> },
                { id: 'gst_mca', label: 'GST & MCA Audits', icon: <FileText size={14} /> },
                { id: 'directors', label: 'Director Network', icon: <User size={14} /> },
                { id: 'litigation', label: 'Litigations timeline', icon: <Scale size={14} /> },
                { id: 'payment', label: 'Payment behaviour', icon: <Activity size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem', whiteSpace: 'nowrap' }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: 1. KYC Overview */}
            {activeTab === 'kyc' && (
              <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: 0 }}>Corporate KYC Registries</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Company CIN</span>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedCompany.cin || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>GSTIN Registry ID</span>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedCompany.gstin || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Permanent Account Number (PAN)</span>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedCompany.pan || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Incorporation Date</span>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedCompany.incorporationDate || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Annual Revenue Turnover</span>
                    <strong style={{ fontSize: '0.95rem' }}>₹{(selectedCompany.annualRevenue || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Official Address</span>
                    <strong style={{ fontSize: '0.9rem' }}>{selectedCompany.regAddress}, {selectedCompany.city}, {selectedCompany.pinCode}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Board of Directors</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {selectedCompany.directors?.split(';').map((d, i) => (
                        <span key={i} style={{ background: 'var(--secondary)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                          👤 {d.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>Primary Communication</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedCompany.email || 'N/A'} | {selectedCompany.phone || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. Credit & Limits */}
            {activeTab === 'credit' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  {/* Credit Score Arc Gauge */}
                  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Credit Score Indicator</span>
                    <div style={{ position: 'relative', width: '120px', height: '80px', marginTop: '1rem' }}>
                      <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%' }}>
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={score >= 700 ? 'var(--success)' : score >= 600 ? 'var(--warning)' : 'var(--danger)'} strokeWidth="8" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={125 - ((score - 300) / 600) * 125} />
                        <text x="50" y="45" textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="bold" fontFamily="Outfit, sans-serif">{score}</text>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '-5px' }}>Prime Rating: {rating}</span>
                  </div>

                  {/* Exposure limit recommendation */}
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Recommended Limit Cap</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '0.75rem 0' }}>
                      ₹{limit.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Terms: {score >= 700 ? 'Net-30 Days' : score >= 600 ? 'Net-15 Days' : 'COD'}</span>
                  </div>

                  {/* Expected default probability */}
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Default Probability</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: risk > 40 ? 'var(--danger)' : 'var(--success)', margin: '0.75rem 0' }}>
                      {risk}%
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Rating: {rating} Grade</span>
                  </div>
                </div>

                {/* AI explanations */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem' }}>AI Score Reasoning Justification</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assessmentData?.explanations?.map((exp: string, eidx: number) => (
                      <div key={eidx} style={{
                        padding: '1rem',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: 'var(--primary)' }}>➔</span>
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. GST & MCA Audits */}
            {activeTab === 'gst_mca' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* GST Filings List */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} style={{ color: 'var(--primary)' }} />
                    Government GST Portal Filings History
                  </h3>
                  <div className="table-container">
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Form type</th>
                          <th>Tax Period</th>
                          <th>Filing Status</th>
                          <th>Timestamp Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gstFilings.map((f, i) => (
                          <tr key={i}>
                            <td><strong>{f.form}</strong></td>
                            <td>{f.period}</td>
                            <td>
                              <span className={`badge ${f.status === 'FILED' ? 'badge-success' : 'badge-danger'}`}>{f.status}</span>
                            </td>
                            <td style={{ color: 'var(--muted)' }}>{f.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MCA filings list */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={18} style={{ color: 'var(--secondary)' }} />
                    Ministry of Corporate Affairs (ROC) filings
                  </h3>
                  <div className="table-container">
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>ROC Form</th>
                          <th>Fiscal period</th>
                          <th>Compliance Status</th>
                          <th>Filing Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mcaFilings.map((f, i) => (
                          <tr key={i}>
                            <td><strong>{f.form}</strong></td>
                            <td>{f.period}</td>
                            <td>
                              <span className={`badge ${f.status === 'FILED' ? 'badge-success' : 'badge-warning'}`}>{f.status}</span>
                            </td>
                            <td style={{ color: 'var(--muted)' }}>{f.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. Director Network Graph */}
            {activeTab === 'directors' && (
              <div className="card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: 0 }}>Director network relationship mapping</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Hover over nodes below to trace DIN registry links and connected company flags.</p>
                </div>

                {/* SVG Graph container */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <svg viewBox="0 0 400 240" style={{ width: '100%', height: '240px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      {/* Connection lines */}
                      <line x1="200" y1="120" x2="80" y2="70" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
                      <line x1="200" y1="120" x2="320" y2="70" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
                      <line x1="200" y1="120" x2="140" y2="190" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
                      <line x1="200" y1="120" x2="260" y2="190" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
                      
                      {/* Center node: Active Company */}
                      <circle cx="200" cy="120" r="24" fill="var(--primary)" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('Active Company profile: Satisfactory KYC standing')} onMouseLeave={() => setHoveredNode(null)} />
                      <text x="200" y="123" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">TARGET CO</text>
                      
                      {/* Director 1 Node */}
                      <circle cx="80" cy="70" r="16" fill="var(--secondary)" stroke="var(--primary)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('Director 1: DIN: 00928172, active on 3 boards')} onMouseLeave={() => setHoveredNode(null)} />
                      <text x="80" y="73" textAnchor="middle" fill="var(--foreground)" fontSize="7" fontWeight="bold">DIR 01</text>
                      
                      {/* Director 2 Node */}
                      <circle cx="320" cy="70" r="16" fill="var(--secondary)" stroke="var(--primary)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('Director 2: DIN: 00726154, active on 2 boards')} onMouseLeave={() => setHoveredNode(null)} />
                      <text x="320" y="73" textAnchor="middle" fill="var(--foreground)" fontSize="7" fontWeight="bold">DIR 02</text>

                      {/* Associated Company A Node */}
                      <rect x="115" y="178" width="50" height="24" rx="4" fill="rgba(16,185,129,0.15)" stroke="var(--success)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('Associated Entity A: Logistics sector, rating: AA, good credit standing')} onMouseLeave={() => setHoveredNode(null)} />
                      <text x="140" y="192" textAnchor="middle" fill="var(--success)" fontSize="6" fontWeight="bold">COMP A</text>

                      {/* Associated Company B Node */}
                      <rect x="235" y="178" width="50" height="24" rx="4" fill="rgba(239,68,68,0.15)" stroke="var(--danger)" strokeWidth="1.5" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode('Associated Entity B: Heavy industry, flag status: STRIKE-OFF Roc liability warning')} onMouseLeave={() => setHoveredNode(null)} />
                      <text x="260" y="192" textAnchor="middle" fill="var(--danger)" fontSize="6" fontWeight="bold">COMP B</text>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)', fontSize: '0.8rem', minHeight: '80px' }}>
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Interactive Node inspector:</span>
                      <p style={{ marginTop: '0.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {hoveredNode || 'Hover over circles or rectangles in the network map to inspect associations.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      <div>🟢 Green border: Low default associations</div>
                      <div>🔴 Red border: High ROC strike-off risk registry</div>
                      <div>🔵 Blue circle: Director identity verification (DIN)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. Litigation & Disputes */}
            {activeTab === 'litigation' && (
              <div className="card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: 0 }}>Dispute Litigation Registry</h3>
                <div className="table-container">
                  <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Case Ref</th>
                        <th>Filing Court</th>
                        <th>Filing Date</th>
                        <th>Disputed Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompany.litigations.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--success)' }}>
                            ✅ Clear record. No outstanding civil litigation cases identified.
                          </td>
                        </tr>
                      ) : (
                        selectedCompany.litigations.map(lit => (
                          <tr key={lit.id}>
                            <td><strong>{lit.caseNumber}</strong></td>
                            <td>{lit.court}</td>
                            <td>{lit.filingDate}</td>
                            <td style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{lit.amountDisputed.toLocaleString('en-IN')}</td>
                            <td>
                              <span className="badge badge-warning">{lit.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--background)', padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Scale size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>AI Legal litigation Summary:</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {selectedCompany.litigations.length > 0 
                        ? `The counterparties litigation index displays potential liability of ₹${selectedCompany.litigations.reduce((s,l) => s+l.amountDisputed, 0).toLocaleString('en-IN')}. Structuring contract recovery notices is advised.`
                        : 'No active civil court cases or insolvency flags are detected. The legal health registry is green.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. Payment Behaviour */}
            {activeTab === 'payment' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  
                  {/* Aging Buckets */}
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>Receivable Aging matrix</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      {[
                        { label: 'Current (0-30d)', percent: 78, color: 'var(--success)' },
                        { label: '30-60 Days', percent: 12, color: 'var(--info)' },
                        { label: '60-90 Days', percent: 8, color: 'var(--warning)' },
                        { label: '90+ Days', percent: 2, color: 'var(--danger)' }
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span>{item.label}</span>
                            <span>{item.percent}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '10px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment heatmap blocks */}
                  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Invoice collection frequency</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', margin: 'auto' }}>
                      {[
                        '#10b981', '#10b981', '#f59e0b', '#10b981', '#10b981', '#10b981',
                        '#10b981', '#ef4444', '#10b981', '#10b981', '#f59e0b', '#10b981',
                        '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444'
                      ].map((color, i) => (
                        <div key={i} style={{ width: '22px', height: '22px', background: color, borderRadius: '4px', opacity: 0.85 }} title="Collection Day check" />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '1rem', fontWeight: 600 }}>
                      <span>🟩 On Time</span>
                      <span>🟨 30d Late</span>
                      <span>🟥 Overdue</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', fontSize: '0.85rem' }}>
                  <strong>AI payment prediction forecast:</strong>
                  <p style={{ color: 'var(--muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    Based on DSO benchmarks, this company is estimated to resolve invoices in **31.2 Days**. Liquid assets are stable, indicating low default probability under standard Net-30 credit lines.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
