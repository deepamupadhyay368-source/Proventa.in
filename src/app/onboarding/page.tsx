'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Building, MapPin, Contact, Activity, DollarSign, CreditCard, Percent, Users, Settings, 
  UserPlus, Sliders, Shield, Upload, Share2, ShieldCheck, CheckCircle2, ClipboardCheck,
  ArrowLeft, ArrowRight, Save, LogOut, Sun, Moon, HelpCircle, FileText
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Company Info', icon: <Building size={16} /> },
  { id: 2, label: 'Addresses', icon: <MapPin size={16} /> },
  { id: 3, label: 'Contact Details', icon: <Contact size={16} /> },
  { id: 4, label: 'Operations', icon: <Activity size={16} /> },
  { id: 5, label: 'Financial Profile', icon: <DollarSign size={16} /> },
  { id: 6, label: 'Banking Details', icon: <CreditCard size={16} /> },
  { id: 7, label: 'Tax Registrations', icon: <Percent size={16} /> },
  { id: 8, label: 'Key Management', icon: <Users size={16} /> },
  { id: 9, label: 'Workspace Admin', icon: <Settings size={16} /> },
  { id: 10, label: 'Team Invitations', icon: <UserPlus size={16} /> },
  { id: 11, label: 'Credit Intelligence', icon: <Sliders size={16} /> },
  { id: 12, label: 'AI Preferences', icon: <Activity size={16} /> },
  { id: 13, label: 'Upload Center', icon: <Upload size={16} /> },
  { id: 14, label: 'Integrations', icon: <Share2 size={16} /> },
  { id: 15, label: 'Org Policies', icon: <Shield size={16} /> },
  { id: 16, label: 'Consent & Compliance', icon: <ShieldCheck size={16} /> },
  { id: 17, label: 'Review & Readiness', icon: <ClipboardCheck size={16} /> },
  { id: 18, label: 'Workspace Creation', icon: <CheckCircle2 size={16} /> }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    name: '',
    tradeName: '',
    legalType: 'PRIVATE_LIMITED',
    industry: 'Technology',
    subIndustry: 'AI & Data Analytics',
    natureOfBusiness: '',
    businessDescription: '',
    incorporationDate: '',
    yearsInBusiness: '1',
    cin: '',
    llpin: '',
    regNumber: '',
    pan: '',
    gstin: '',
    msmeNumber: '',
    iecCode: '',
    tan: '',
    lei: '',
    startupRecognitionNumber: '',

    // Step 2: Registered Address
    regAddress: '',
    corpAddress: '',
    branchLocations: '', // Semi-colon separated
    warehouseLocations: '',
    factoryLocations: '',
    country: 'India',
    state: '',
    city: '',
    pinCode: '',

    // Step 3: Contact Info
    officialEmail: '',
    financeEmail: '',
    accountsEmail: '',
    salesEmail: '',
    supportEmail: '',
    phoneNumbers: '',
    mobileNumbers: '',
    website: '',
    linkedinUrl: '',

    // Step 4: Business Operations
    employeeCount: '15',
    annualTurnoverRange: '1M-5M',
    monthlyRevenueRange: '100K-500K',
    customerCount: '20',
    vendorCount: '15',
    domesticOps: true,
    internationalOps: false,
    countriesServed: 'India',
    products: '',
    services: '',
    businessModel: 'B2B',
    seasonality: 'None',
    creditTermsOffered: 'Net-30',
    paymentCycles: 'Monthly',

    // Step 5: Financial Profile
    fiscalYear: 'FY2025-26',
    currency: 'USD',
    revenue: '1200000',
    ebitda: '300000',
    netProfit: '180000',
    existingLoans: '',
    bankingRelationships: '',
    existingCreditLimits: '',
    workingCapitalFacilities: '',
    overdraftFacilities: '',
    insuranceProviders: '',

    // Step 6: Banking Details (multiple accounts parsed as JSON array of structures)
    bankName: '',
    bankAccountType: 'CURRENT',
    bankAccountNumber: '',
    bankIfsc: '',
    bankBranch: '',
    bankHolderName: '',

    // Step 7: Tax Information
    taxGstRegistrations: '',
    taxGstStates: '',
    taxFilingFrequency: 'MONTHLY',
    taxProfessionalTax: '',

    // Step 8: Key Management Personnel
    kmpName: '',
    kmpDesignation: 'CEO',
    kmpEmail: '',
    kmpMobile: '',
    kmpDepartment: 'Management',

    // Step 9: Workspace Administration
    workspaceName: '',
    workspaceTimezone: 'UTC+5:30',
    workspaceLanguage: 'en-US',
    workspaceDateFormat: 'YYYY-MM-DD',
    workspaceCurrency: 'USD',
    workspaceFiscalYearStart: 'April',

    // Step 10: Team Invitations
    invitations: '', // Comma separated emails

    // Step 11: Credit Intelligence Config
    avgMonthlyInvoices: '150',
    avgCreditSales: '500000',
    customerPaymentTerms: 'Net-30',
    vendorPaymentTerms: 'Net-15',
    collectionCycle: '35',
    dsoTarget: '30',
    creditPolicyRiskAppetite: 'MODERATE',

    // Step 12: AI Preferences
    aiRiskAnalysis: true,
    aiCashFlowForecasting: true,
    aiFraudDetection: true,
    aiDelayPrediction: true,
    aiReportsWeekly: true,
    aiReportsMonthly: true,

    // Step 14: Integrations
    connectAccounting: 'NONE',
    connectERP: 'NONE',
    connectCRM: 'NONE',

    // Step 15: Org Policies
    policyPasswordMinLength: '14',
    policyMfaRequired: true,
    policySessionTimeout: '30',
    policyDataRetentionYears: '7',

    // Step 16: Compliance & Consent
    acceptTerms: false,
    acceptPrivacy: false,
    acceptDataProcessing: false,
  });

  // Files vault state
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    logo: null,
    gstCert: null,
    panCard: null,
    coiCert: null,
    msmeCert: null,
    chequeCopy: null,
    bankStmt: null,
    finStmt: null,
  });

  // Verification step auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Restore Draft Onboarding
  useEffect(() => {
    const savedDraft = localStorage.getItem('proventa_onboarding_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...prev, ...parsed.formData }));
        setCurrentStep(parsed.currentStep || 1);
        setAutoSavedTime(parsed.savedAt || '');
      } catch (e) {}
    }
  }, []);

  // Autosave setup (Runs every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraftSilently();
    }, 5000);
    return () => clearInterval(interval);
  }, [formData, currentStep]);

  const saveDraftSilently = () => {
    const savedAt = new Date().toLocaleTimeString();
    localStorage.setItem('proventa_onboarding_draft', JSON.stringify({
      formData,
      currentStep,
      savedAt
    }));
    setAutoSavedTime(savedAt);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
      saveDraftSilently();
    }
  };

  // Readiness Score Calculator (Percentage of completed required fields)
  const calculateReadinessScore = () => {
    const requiredFields = [
      formData.name,
      formData.legalType,
      formData.industry,
      formData.regAddress,
      formData.country,
      formData.state,
      formData.city,
      formData.pinCode,
      formData.officialEmail,
      formData.revenue,
      formData.bankName,
      formData.bankAccountNumber,
      formData.workspaceName
    ];
    const completed = requiredFields.filter(f => !!f).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name) return 'Legal Company Name is required';
      if (!formData.legalType) return 'Company Legal Type is required';
      if (!formData.industry) return 'Industry vertical selection is required';
    } else if (currentStep === 2) {
      if (!formData.regAddress) return 'Registered Office Address is required';
      if (!formData.country) return 'Country is required';
      if (!formData.state) return 'State is required';
      if (!formData.city) return 'City is required';
      if (!formData.pinCode) return 'Postal Code is required';
    } else if (currentStep === 3) {
      if (!formData.officialEmail) return 'Official Corporate Email is required';
    } else if (currentStep === 9) {
      if (!formData.workspaceName) return 'Organization Workspace Name is required';
    } else if (currentStep === 16) {
      if (!formData.acceptTerms || !formData.acceptPrivacy) return 'Accepting Terms of Service and Privacy Policies is required to proceed.';
    }
    return null;
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 18));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const exitOnboarding = () => {
    saveDraftSilently();
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      // Add all string fields
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, String(val));
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          data.append(key, file);
        }
      });

      const res = await fetch('/api/company/onboard', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Onboarding registration failed');
      }

      // Clear local storage draft
      localStorage.removeItem('proventa_onboarding_draft');
      setSuccess(true);
      
      // Auto redirect to dashboard after success animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--background)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3.5rem', maxWidth: '550px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800 }}>Workspace Configured!</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.75rem', lineHeight: '1.6' }}>
            Your organization workspace, tenant isolation encryption keys, and default security parameters have been generated.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
            Initializing Executive Intelligence Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="top-nav" style={{ padding: '0 2rem' }}>
        <div className="logo-container">
          <div className="logo-icon">P</div>
          PROVENTA
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {autoSavedTime && (
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Auto-saved at {autoSavedTime}
            </span>
          )}
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Owner: {user.email}</span>
          <button onClick={toggleTheme} className="theme-switch">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
        {/* Left Navigation Steps Menu */}
        <aside className="sidebar" style={{ width: '280px', height: 'calc(100vh - 64px)', overflowY: 'auto', background: 'var(--card)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>ONBOARDING PROGRESS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>Readiness Score</strong>
              <span className="badge badge-success">{calculateReadinessScore()}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--secondary)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${calculateReadinessScore()}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s' }} />
            </div>
          </div>
          <div className="sidebar-nav">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const err = validateStep();
                  if (!err || s.id < currentStep) {
                    setCurrentStep(s.id);
                  }
                }}
                className={`sidebar-link ${currentStep === s.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: currentStep === s.id ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: currentStep === s.id ? 700 : 500,
                  opacity: s.id > currentStep ? 0.6 : 1
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: currentStep === s.id ? 'rgba(37,99,235,0.08)' : 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentStep === s.id ? 'var(--primary)' : 'inherit'
                }}>
                  {s.id < currentStep ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> : s.icon}
                </div>
                <span>{s.id}. {s.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center/Right Form Area */}
        <main className="main-content" style={{ padding: '3rem 2rem', overflowY: 'auto', height: 'calc(100vh - 64px)', flex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {error && (
              <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="card" style={{ padding: '3rem' }}>
              
              {/* STEP 1: Company Information */}
              {currentStep === 1 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Company Information</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Enter the primary legal identifiers for the business entity.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Legal Company Name *</label>
                      <input type="text" name="name" required placeholder="Acme Corporation Private Limited" className="form-input" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Trade / Brand Name</label>
                      <input type="text" name="tradeName" placeholder="Acme AI" className="form-input" value={formData.tradeName} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Company Legal Type *</label>
                      <select name="legalType" className="form-input" value={formData.legalType} onChange={handleInputChange}>
                        <option value="PRIVATE_LIMITED">Private Limited Company</option>
                        <option value="PUBLIC_LIMITED">Public Limited Company</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                        <option value="PARTNERSHIP">Partnership Firm</option>
                        <option value="TRUST">Trust / Society</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry Classification *</label>
                      <input type="text" name="industry" placeholder="Technology / SaaS" className="form-input" value={formData.industry} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Sub-Industry</label>
                      <input type="text" name="subIndustry" placeholder="Enterprise Software" className="form-input" value={formData.subIndustry} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nature of Business</label>
                      <input type="text" name="natureOfBusiness" placeholder="Software Manufacturing & Sales" className="form-input" value={formData.natureOfBusiness} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Date of Incorporation</label>
                      <input type="date" name="incorporationDate" className="form-input" value={formData.incorporationDate} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years in Business</label>
                      <input type="number" name="yearsInBusiness" className="form-input" value={formData.yearsInBusiness} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Corporate ID (CIN)</label>
                      <input type="text" name="cin" placeholder="U72200KA2020PTC134958" className="form-input" value={formData.cin} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GSTIN</label>
                      <input type="text" name="gstin" placeholder="29AAAAA0000A1Z5" className="form-input" value={formData.gstin} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PAN</label>
                      <input type="text" name="pan" placeholder="ABCDE1234F" className="form-input" value={formData.pan} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">MSME/Udyam Number</label>
                      <input type="text" name="msmeNumber" placeholder="UDYAM-KR-03-0000000" className="form-input" value={formData.msmeNumber} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Import Export Code (IEC)</label>
                      <input type="text" name="iecCode" placeholder="0100000000" className="form-input" value={formData.iecCode} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">TAN</label>
                      <input type="text" name="tan" placeholder="BLRA00000A" className="form-input" value={formData.tan} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Registered Address */}
              {currentStep === 2 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Addresses & Locations</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Define physical business locations. Supports multiple offices.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registered Office Address *</label>
                    <input type="text" name="regAddress" required placeholder="Floor 4, Block A, Tech Park Road" className="form-input" value={formData.regAddress} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Corporate Office Address</label>
                    <input type="text" name="corpAddress" placeholder="Same as Registered Address" className="form-input" value={formData.corpAddress} onChange={handleInputChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <input type="text" name="country" required className="form-input" value={formData.country} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input type="text" name="state" required placeholder="Karnataka" className="form-input" value={formData.state} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input type="text" name="city" required placeholder="Bangalore" className="form-input" value={formData.city} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal / ZIP Code *</label>
                    <input type="text" name="pinCode" required placeholder="560001" className="form-input" value={formData.pinCode} onChange={handleInputChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Warehouse Locations (Semi-colon separated)</label>
                      <input type="text" name="warehouseLocations" placeholder="Warehouse A - Bangalore; Warehouse B - Chennai" className="form-input" value={formData.warehouseLocations} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Factory / Plant Locations</label>
                      <input type="text" name="factoryLocations" placeholder="Plant A - Karnataka" className="form-input" value={formData.factoryLocations} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Contact Information */}
              {currentStep === 3 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Contact Information</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Communication channels for accounts, credit claims, and support.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Official Corporate Email *</label>
                      <input type="email" name="officialEmail" required placeholder="info@acme.com" className="form-input" value={formData.officialEmail} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Finance Email</label>
                      <input type="email" name="financeEmail" placeholder="finance@acme.com" className="form-input" value={formData.financeEmail} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Accounts Email</label>
                      <input type="email" name="accountsEmail" placeholder="billing@acme.com" className="form-input" value={formData.accountsEmail} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sales Email</label>
                      <input type="email" name="salesEmail" placeholder="sales@acme.com" className="form-input" value={formData.salesEmail} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Support Email</label>
                      <input type="email" name="supportEmail" placeholder="support@acme.com" className="form-input" value={formData.supportEmail} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Mobile Numbers</label>
                      <input type="text" name="mobileNumbers" placeholder="+91 98765 43210" className="form-input" value={formData.mobileNumbers} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website URL</label>
                      <input type="text" name="website" placeholder="https://acme.com" className="form-input" value={formData.website} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Corporate URL</label>
                    <input type="text" name="linkedinUrl" placeholder="https://linkedin.com/company/acme" className="form-input" value={formData.linkedinUrl} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* STEP 4: Business Operations */}
              {currentStep === 4 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Business Operations</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Scope of trading, business models, and credit terms.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Total Employee Count</label>
                      <input type="number" name="employeeCount" className="form-input" value={formData.employeeCount} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Model</label>
                      <select name="businessModel" className="form-input" value={formData.businessModel} onChange={handleInputChange}>
                        <option value="B2B">Business to Business (B2B)</option>
                        <option value="B2C">Business to Consumer (B2C)</option>
                        <option value="D2C">Direct to Consumer (D2C)</option>
                        <option value="MARKETPLACE">Marketplace / Platform</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Client Count</label>
                      <input type="number" name="customerCount" className="form-input" value={formData.customerCount} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vendor Count</label>
                      <input type="number" name="vendorCount" className="form-input" value={formData.vendorCount} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Credit Terms Offered</label>
                      <select name="creditTermsOffered" className="form-input" value={formData.creditTermsOffered} onChange={handleInputChange}>
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="Net-15">Net 15 Days</option>
                        <option value="Net-30">Net 30 Days</option>
                        <option value="Net-60">Net 60 Days</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Domestic Trading</label>
                      <select name="domesticOps" className="form-input" value={String(formData.domesticOps)} onChange={(e) => setFormData(prev => ({ ...prev, domesticOps: e.target.value === 'true' }))}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">International Trading</label>
                      <select name="internationalOps" className="form-input" value={String(formData.internationalOps)} onChange={(e) => setFormData(prev => ({ ...prev, internationalOps: e.target.value === 'true' }))}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Countries Served</label>
                    <input type="text" name="countriesServed" placeholder="India; USA; UAE" className="form-input" value={formData.countriesServed} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* STEP 5: Financial Profile */}
              {currentStep === 5 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Financial Profile</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Balance sheet scaling, turnover capacity, and existing liabilities.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Annual Revenue (USD)</label>
                      <input type="number" name="revenue" className="form-input" value={formData.revenue} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">EBITDA (USD)</label>
                      <input type="number" name="ebitda" className="form-input" value={formData.ebitda} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Net Profit (USD)</label>
                      <input type="number" name="netProfit" className="form-input" value={formData.netProfit} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Outstanding Loans / Liabilities</label>
                    <input type="text" name="existingLoans" placeholder="Term loan: $250,000" className="form-input" value={formData.existingLoans} onChange={handleInputChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Working Capital Facilities</label>
                      <input type="text" name="workingCapitalFacilities" placeholder="Letter of Credit: $100,000" className="form-input" value={formData.workingCapitalFacilities} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Overdraft Facilities</label>
                      <input type="text" name="overdraftFacilities" placeholder="OD Limit: $50,000" className="form-input" value={formData.overdraftFacilities} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Banking Details */}
              {currentStep === 6 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Banking Details</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Primary accounts for transaction validation and invoice clearing.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Bank Name *</label>
                      <input type="text" name="bankName" required placeholder="HDFC Bank" className="form-input" value={formData.bankName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Holder Name *</label>
                      <input type="text" name="bankHolderName" required placeholder="Acme Corp Ltd" className="form-input" value={formData.bankHolderName} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Account Number *</label>
                      <input type="text" name="bankAccountNumber" required placeholder="50200000000000" className="form-input" value={formData.bankAccountNumber} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC / SWIFT Code *</label>
                      <input type="text" name="bankIfsc" required placeholder="HDFC0000001" className="form-input" value={formData.bankIfsc} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch Location</label>
                    <input type="text" name="bankBranch" placeholder="MG Road, Bangalore" className="form-input" value={formData.bankBranch} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* STEP 7: Tax Registrations */}
              {currentStep === 7 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Tax Registrations</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>GST configurations, active filing cycles, and regional identifiers.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">GST Registrations (Multiple separated by commas)</label>
                      <input type="text" name="taxGstRegistrations" placeholder="29AAAAA0000A1Z5, 27AAAAA0000A1Z6" className="form-input" value={formData.taxGstRegistrations} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST Filing Cycle</label>
                      <select name="taxFilingFrequency" className="form-input" value={formData.taxFilingFrequency} onChange={handleInputChange}>
                        <option value="MONTHLY">Monthly Filing</option>
                        <option value="QUARTERLY">Quarterly Filing</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST Registered States</label>
                    <input type="text" name="taxGstStates" placeholder="Karnataka; Maharashtra" className="form-input" value={formData.taxGstStates} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professional Tax Reg Number</label>
                    <input type="text" name="taxProfessionalTax" placeholder="PT10293848" className="form-input" value={formData.taxProfessionalTax} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* STEP 8: Key Management Personnel */}
              {currentStep === 8 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Key Management Personnel</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Active board directors, CFOs, or legal executive signers.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" name="kmpName" placeholder="John Doe" className="form-input" value={formData.kmpName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation *</label>
                      <select name="kmpDesignation" className="form-input" value={formData.kmpDesignation} onChange={handleInputChange}>
                        <option value="CEO">Chief Executive Officer (CEO)</option>
                        <option value="CFO">Chief Financial Officer (CFO)</option>
                        <option value="FINANCE_HEAD">Head of Finance</option>
                        <option value="DIRECTOR">Director / Board Member</option>
                        <option value="PARTNER">Managing Partner</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <input type="email" name="kmpEmail" placeholder="johndoe@acme.com" className="form-input" value={formData.kmpEmail} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input type="text" name="kmpMobile" placeholder="+91 99000 99000" className="form-input" value={formData.kmpMobile} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: Workspace Administration */}
              {currentStep === 9 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Workspace Administration</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Establish the organization tenant and workspace settings.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Organization Workspace Name *</label>
                    <input type="text" name="workspaceName" required placeholder="Acme Global Workspace" className="form-input" value={formData.workspaceName} onChange={handleInputChange} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Preferred Time Zone</label>
                      <select name="workspaceTimezone" className="form-input" value={formData.workspaceTimezone} onChange={handleInputChange}>
                        <option value="UTC+5:30">Kolkata, Mumbai (UTC+5:30)</option>
                        <option value="UTC-5:00">Eastern Time US (UTC-5:00)</option>
                        <option value="UTC+0:00">Greenwich Mean Time (UTC+0:00)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Primary Language</label>
                      <select name="workspaceLanguage" className="form-input" value={formData.workspaceLanguage} onChange={handleInputChange}>
                        <option value="en-US">English (United States)</option>
                        <option value="en-IN">English (India)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: Team Invitations */}
              {currentStep === 10 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Team Invitations</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Add colleagues and delegate platform roles.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Invite Coworkers (Enter email addresses separated by commas)</label>
                    <textarea name="invitations" rows={4} placeholder="finance-analyst@acme.com, controller@acme.com" className="form-input" value={formData.invitations} onChange={handleInputChange} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Invited users will receive a secure magic signup link mapping them automatically to this tenant structure.
                  </p>
                </div>
              )}

              {/* STEP 11: Credit Intelligence Configuration */}
              {currentStep === 11 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Credit Policy Settings</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Define DSO targets, credit cycles, and risk tolerances.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Average Monthly Invoices</label>
                      <input type="number" name="avgMonthlyInvoices" className="form-input" value={formData.avgMonthlyInvoices} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Average Monthly Credit Sales (USD)</label>
                      <input type="number" name="avgCreditSales" className="form-input" value={formData.avgCreditSales} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">DSO Target (Days)</label>
                      <input type="number" name="dsoTarget" className="form-input" value={formData.dsoTarget} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Collection Cycle (Days)</label>
                      <input type="number" name="collectionCycle" className="form-input" value={formData.collectionCycle} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Risk Appetite</label>
                      <select name="creditPolicyRiskAppetite" className="form-input" value={formData.creditPolicyRiskAppetite} onChange={handleInputChange}>
                        <option value="CONSERVATIVE">Conservative / Strict</option>
                        <option value="MODERATE">Moderate / Dynamic</option>
                        <option value="AGGRESSIVE">Aggressive / Scalable</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 12: AI Preferences */}
              {currentStep === 12 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>AI Preferences</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Opt in or out of AI-powered modeling, Cash Flow predictions, and fraud warning monitors.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="aiRiskAnalysis" checked={formData.aiRiskAnalysis} onChange={handleInputChange} />
                      <div>
                        <strong>Enable AI Credit Risk Analysis</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Automatically score counterparties using ML gearing matrices.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="aiCashFlowForecasting" checked={formData.aiCashFlowForecasting} onChange={handleInputChange} />
                      <div>
                        <strong>Enable AI Cash Flow Forecasting</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Project working capital requirements using invoices history.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="aiFraudDetection" checked={formData.aiFraudDetection} onChange={handleInputChange} />
                      <div>
                        <strong>Enable AI Corporate Fraud Detection</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Flag mismatch indicators in uploaded registry certificates.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 13: Document Upload Center */}
              {currentStep === 13 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Document Upload Center</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Upload corporate certificates. Files are encrypted at rest.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'coiCert', label: 'Certificate of Incorporation (COI) *' },
                      { key: 'gstCert', label: 'GST Registration Certificate *' },
                      { key: 'panCard', label: 'PAN Card Copy *' },
                      { key: 'bankStmt', label: 'Latest 6 Months Bank Statements *' },
                      { key: 'finStmt', label: 'Audited Financial Statements (Latest 2 Years) *' },
                    ].map((field) => (
                      <div key={field.key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--background)'
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{field.label}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {files[field.key] ? `Attached: ${files[field.key]!.name} (${(files[field.key]!.size / 1024).toFixed(1)} KB)` : 'Drag and drop or select file'}
                          </div>
                        </div>
                        <label style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          Select File
                          <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, field.key)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 14: Integrations */}
              {currentStep === 14 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Integrations</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Connect ERP, accounting software, and banking APIs.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Connect Accounting Tool</label>
                      <select name="connectAccounting" className="form-input" value={formData.connectAccounting} onChange={handleInputChange}>
                        <option value="NONE">No Sync / Manual Upload</option>
                        <option value="QUICKBOOKS">QuickBooks Online</option>
                        <option value="XERO">Xero</option>
                        <option value="ZOHO">Zoho Books</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Connect Enterprise ERP</label>
                      <select name="connectERP" className="form-input" value={formData.connectERP} onChange={handleInputChange}>
                        <option value="NONE">No Sync</option>
                        <option value="SAP">SAP S/4HANA</option>
                        <option value="NETSUITE">Oracle NetSuite</option>
                        <option value="MICROSOFT_DYNAMICS">Microsoft Dynamics 365</option>
                      </select>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    OAuth consent tokens are stored securely in database vaults and require explicit admin approval on first sync.
                  </p>
                </div>
              )}

              {/* STEP 15: Organization Policies */}
              {currentStep === 15 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Organization Security Policies</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Establish tenant security protocols.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Password Policy (Minimum Length)</label>
                      <select name="policyPasswordMinLength" className="form-input" value={formData.policyPasswordMinLength} onChange={handleInputChange}>
                        <option value="14">14 Characters (Standard)</option>
                        <option value="16">16 Characters (High Security)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Session Idle Timeout (Minutes)</label>
                      <select name="policySessionTimeout" className="form-input" value={formData.policySessionTimeout} onChange={handleInputChange}>
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes (Recommended)</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
                    <input type="checkbox" name="policyMfaRequired" checked={formData.policyMfaRequired} onChange={handleInputChange} />
                    <div>
                      <strong>Enforce MFA (TOTP) for All Users</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Requires authentication code setup on next login.</div>
                    </div>
                  </label>
                </div>
              )}

              {/* STEP 16: Compliance & Consent */}
              {currentStep === 16 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Consent & Compliance</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Record terms agreement for audit history.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleInputChange} />
                      <span style={{ fontSize: '0.9rem' }}>I accept the Proventa <strong>Terms of Service</strong> and agree to automated registry checks.</span>
                    </label>

                    <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="acceptPrivacy" checked={formData.acceptPrivacy} onChange={handleInputChange} />
                      <span style={{ fontSize: '0.9rem' }}>I accept the <strong>Privacy Policy</strong> detailing AES-256-GCM data storage encryption protocols.</span>
                    </label>

                    <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="acceptDataProcessing" checked={formData.acceptDataProcessing} onChange={handleInputChange} />
                      <span style={{ fontSize: '0.9rem' }}>I accept the <strong>Data Processing Agreement</strong> detailing tenant boundary isolations.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 17: Review & Confirmation */}
              {currentStep === 17 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Review & Confirmation</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Verify all parameters before creating the workspace environment.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--muted)' }}>Legal Name:</span>
                      <strong>{formData.name || 'Not provided'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--muted)' }}>Legal Entity Type:</span>
                      <strong>{formData.legalType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--muted)' }}>Corporate Address:</span>
                      <strong>{formData.regAddress || 'Not provided'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--muted)' }}>Workspace Title:</span>
                      <strong>{formData.workspaceName || 'Not provided'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Readiness Score:</span>
                      <strong style={{ color: 'var(--success)' }}>{calculateReadinessScore()}%</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 18: Workspace Creation */}
              {currentStep === 18 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(37,99,235,0.08)',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ClipboardCheck size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', fontWeight: 800 }}>Finalize & Create Workspace</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '500px' }}>
                      By clicking submit, you authorize Proventa to initialize your secure tenant data environment, configure per-tenant AES keys, and deploy dashboards.
                    </p>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem 3rem', background: 'var(--success)', marginTop: '1rem' }}>
                    {loading ? 'Initializing Secure Workspace...' : 'Initialize Platform Workspace'}
                  </button>
                </div>
              )}

              {/* Wizard Footer Controls */}
              {currentStep !== 18 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div>
                    {currentStep > 1 && (
                      <button type="button" onClick={prevStep} className="btn btn-secondary">
                        <ArrowLeft size={16} />
                        Back
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={exitOnboarding} className="btn btn-secondary">
                      <Save size={16} />
                      Save Draft & Exit
                    </button>
                    
                    <button type="button" onClick={nextStep} className="btn btn-primary">
                      Next Step
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
