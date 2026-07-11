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
  Briefcase
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

  const exportExcel = () => {
    if (!selectedCompany) return;
    const assess = selectedCompany.assessments[0];
    let xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>`;
    
    const rows = [
      ['Proventa Credit Intelligence Report', ''],
      ['Generated Date', new Date().toLocaleDateString()],
      ['', ''],
      ['Corporate Profile', ''],
      ['Company Legal Name', selectedCompany.name],
      ['Industry Vertical', selectedCompany.industry],
      ['Incorporation Date', selectedCompany.incorporationDate || 'N/A'],
      ['Registered Address', selectedCompany.regAddress],
      ['CIN', selectedCompany.cin || 'N/A'],
      ['GSTIN', selectedCompany.gstin || 'N/A'],
      ['PAN', selectedCompany.pan || 'N/A'],
      ['', ''],
      ['Credit Risk Metrics', ''],
      ['Credit Score (300-900)', assess?.creditScore || '500'],
      ['Credit Rating Grade', assess?.creditRating || 'B'],
      ['Platform Risk Coefficient', `${assess?.riskScore || 50}%`],
      ['Recommended Limit (USD)', assess?.recommendedLimit || 0],
    ];

    rows.forEach(r => {
      xml += '<Row>';
      r.forEach(val => {
        xml += `<Cell><Data ss:Type="String">${val}</Data></Cell>`;
      });
      xml += '</Row>';
    });

    xml += '</Table></Worksheet></Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedCompany.name.replace(/\s+/g, '_')}_Credit_Report.xls`);
    a.click();
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Global Search and filtration section */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} />
          Global Search & Discovery Hub
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search companies, GSTIN, PAN, CIN, or directors..." 
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

      <div className="dashboard-grid">
        {/* Left Side: Search results list */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
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
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--background)',
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
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No companies match filter.</span>
            )}
          </div>
        </div>

        {/* Right Side: Active Company Dossier */}
        {selectedCompany && (
          <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Identity banner */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>{selectedCompany.name}</h2>
                  {watchlist.includes(selectedCompany.id) && (
                    <Bookmark size={18} fill="var(--warning)" stroke="var(--warning)" title="Watchlist item" />
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {selectedCompany.legalType.replace('_', ' ')} • {selectedCompany.industry} • Registered: {selectedCompany.city}, {selectedCompany.state}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportCsv} className="btn btn-secondary btn-sm">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={printPdf} className="btn btn-primary btn-sm">
                  Print Report
                </button>
              </div>
            </div>

            {/* Score & Limit KPI block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Credit Rating</div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: score >= 700 ? 'var(--success)' : score >= 600 ? 'var(--warning)' : 'var(--danger)',
                  marginTop: '0.25rem'
                }}>
                  {rating}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Score: {score}/900</span>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Risk Coefficient</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: risk > 50 ? 'var(--danger)' : 'inherit', marginTop: '0.25rem' }}>
                  {risk}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Default Probability</span>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Credit Limit Cap</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  ${limit.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Terms: {score >= 700 ? 'Net-30' : score >= 600 ? 'Net-15' : 'COD'}</span>
              </div>
            </div>

            {/* KYC details grid */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700 }}>Corporate KYC Registries</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Company CIN</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCompany.cin || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>GSTIN Registration</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCompany.gstin || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>PAN Card</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCompany.pan || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Incorporation Date</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCompany.incorporationDate || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Annual Revenue</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>${selectedCompany.annualRevenue?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Corporate Headquarters</span>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedCompany.regAddress}, {selectedCompany.city}, {selectedCompany.pinCode}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Board of Directors</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'pre-line' }}>{selectedCompany.directors?.replace(/;/g, '\n') || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Primary Contact details</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedCompany.email || 'N/A'} | {selectedCompany.phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* AI Reasoning explanations */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem' }}>AI credit Risk justification</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assessmentData?.explanations?.map((exp: string, eidx: number) => (
                  <div key={eidx} style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem'
                  }}>
                    {exp}
                  </div>
                ))}
              </div>
            </div>

            {/* Litigations */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem' }}>Dispute Litigation Registry</h3>
              <div className="table-container">
                <table className="data-table">
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
                          <td style={{ color: 'var(--danger)', fontWeight: 700 }}>${lit.amountDisputed.toLocaleString()}</td>
                          <td>
                            <span className="badge badge-warning">{lit.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
