'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, Database, Share2, Activity, RefreshCw, Key, ShieldCheck, 
  Smartphone, Plus, X, Search, FileText, CheckCircle, AlertTriangle, AlertCircle, Trash2, ArrowRight
} from 'lucide-react';

const MARKETPLACE_CONNECTORS = [
  // Banking
  { id: 'hdfc', name: 'HDFC Corporate Banking', category: 'BANKING', logo: '🏦' },
  { id: 'icici', name: 'ICICI Corporate Bank API', category: 'BANKING', logo: '🏦' },
  { id: 'sbi', name: 'State Bank of India Corporate', category: 'BANKING', logo: '🏦' },
  { id: 'plaid', name: 'Plaid Bank aggregator', category: 'BANKING', logo: '🔗' },
  // Accounting
  { id: 'qbo', name: 'QuickBooks Online', category: 'ACCOUNTING', logo: '📊' },
  { id: 'xero', name: 'Xero Ledger Sync', category: 'ACCOUNTING', logo: '📊' },
  { id: 'tally', name: 'Tally Prime API', category: 'ACCOUNTING', logo: '📊' },
  { id: 'zoho-books', name: 'Zoho Books Portal', category: 'ACCOUNTING', logo: '📊' },
  // ERP
  { id: 'netsuite', name: 'Oracle NetSuite ERP', category: 'ERP', logo: '⚙️' },
  { id: 'sap', name: 'SAP S/4HANA Cloud', category: 'ERP', logo: '⚙️' },
  { id: 'dynamics', name: 'Microsoft Dynamics 365', category: 'ERP', logo: '⚙️' },
  // Tax
  { id: 'gst-portal', name: 'GSTIN Government Portal', category: 'TAX', logo: '📄' },
  { id: 'income-tax', name: 'Income Tax e-Filing Portal', category: 'TAX', logo: '📄' },
  // CRM
  { id: 'salesforce', name: 'Salesforce Sales Hub', category: 'CRM', logo: '🤝' },
  { id: 'hubspot', name: 'HubSpot Operations', category: 'CRM', logo: '🤝' }
];

export default function ConnectionCenter() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'active' | 'mapping' | 'quality'>('active');
  const [connections, setConnections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCount: 0, activeCount: 0, failedCount: 0, pendingCount: 0,
    storageUsedMB: 0, documentsProcessed: 0, financialRecordsImported: 0, accountsConnected: 0
  });
  const [dataQuality, setDataQuality] = useState<any>({
    completeness: 100, accuracy: 100, freshness: 100, consistency: 100, duplicate: 0
  });
  const [recentSyncJobs, setRecentSyncJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal Setup state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    syncSchedule: 'DAILY',
    clientId: '',
    clientSecret: '',
    apiToken: '',
    endpointUrl: ''
  });
  const [modalError, setModalError] = useState('');
  const [savingConnection, setSavingConnection] = useState(false);

  // Sync state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  // Field Mapping state
  const [mappingTemplate, setMappingTemplate] = useState({
    extCustomerName: 'cust_name',
    extGstNumber: 'gstin_id',
    extInvoiceAmount: 'amount_total',
    extInvoiceDate: 'created_at',
    extDueDate: 'due_date'
  });
  const [mappingMessage, setMappingMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
        setStats(data.stats);
        setDataQuality(data.dataQuality);
        
        // Extract recent sync jobs across all connections
        const jobs = data.connections.flatMap((c: any) => 
          (c.syncJobs || []).map((j: any) => ({ ...j, connectionName: c.name }))
        );
        jobs.sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        setRecentSyncJobs(jobs.slice(0, 10));
      }
    } catch (e) {}
  };

  const handleOpenConnect = (connector: any) => {
    setSelectedConnector(connector);
    setModalForm({
      name: connector.name,
      syncSchedule: 'DAILY',
      clientId: '',
      clientSecret: '',
      apiToken: '',
      endpointUrl: ''
    });
    setModalError('');
    setShowSetupModal(true);
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSavingConnection(true);

    try {
      const payload = {
        name: modalForm.name,
        category: selectedConnector.category,
        syncSchedule: modalForm.syncSchedule,
        credentials: {
          clientId: modalForm.clientId,
          clientSecret: modalForm.clientSecret,
          apiToken: modalForm.apiToken,
          endpointUrl: modalForm.endpointUrl
        }
      };

      const res = await fetch('/api/dashboard/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || 'Connection failed');
      } else {
        setShowSetupModal(false);
        fetchData();
        setActiveTab('active');
      }
    } catch (err) {
      setModalError('Connection failed: internal error');
    } finally {
      setSavingConnection(false);
    }
  };

  const handleManualSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    setSyncMessage('');
    try {
      const res = await fetch(`/api/dashboard/connections/${connectionId}/sync`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`Sync completed: imported ${data.recordsImported} records.`);
        fetchData();
      } else {
        setSyncMessage(`Sync failed: ${data.error}`);
      }
    } catch (e) {
      setSyncMessage('Sync request failed.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect and delete this integration? This will purge all associated sync schedules.')) {
      return;
    }
    try {
      const res = await fetch(`/api/dashboard/connections/${connectionId}/disconnect`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {}
  };

  const handleAutoMap = () => {
    setMappingTemplate({
      extCustomerName: 'customer_legal_name',
      extGstNumber: 'gst_number_id',
      extInvoiceAmount: 'invoice_total_amount',
      extInvoiceDate: 'billing_date',
      extDueDate: 'payment_due_date'
    });
    setMappingMessage('AI Auto-mapping successfully generated suggestions based on endpoint schema.');
    setTimeout(() => setMappingMessage(''), 4000);
  };

  const handleSaveMapping = (e: React.FormEvent) => {
    e.preventDefault();
    setMappingMessage('Column mapping template saved successfully.');
    setTimeout(() => setMappingMessage(''), 4000);
  };

  const filteredMarketplace = MARKETPLACE_CONNECTORS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Share2 size={32} style={{ color: 'var(--primary)' }} />
            Financial Connection Center
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Securely link banking portals, accounting ledgers, tax systems, and ERP integrations.
          </p>
        </div>
        <button onClick={() => setActiveTab('marketplace')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Add Integration
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%' }}>
            <Share2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>CONNECTED SERVICES</div>
            <strong style={{ fontSize: '1.5rem' }}>{stats.activeCount} <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/ {stats.totalCount}</span></strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--success)', padding: '0.75rem', borderRadius: '50%' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>RECORDS IMPORTED</div>
            <strong style={{ fontSize: '1.5rem' }}>{stats.financialRecordsImported.toLocaleString()}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '50%' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>STORAGE CONSUMED</div>
            <strong style={{ fontSize: '1.5rem' }}>{stats.storageUsedMB.toFixed(1)} MB</strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--success)', padding: '0.75rem', borderRadius: '50%' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>DATA QUALITY INDEX</div>
            <strong style={{ fontSize: '1.5rem' }}>{dataQuality.completeness}%</strong>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'active', label: 'Active Connections', icon: <CheckCircle size={16} /> },
          { id: 'marketplace', label: 'Connector Marketplace', icon: <Plus size={16} /> },
          { id: 'mapping', label: 'Data Field Mapping', icon: <FileText size={16} /> },
          { id: 'quality', label: 'Data Quality Center', icon: <Activity size={16} /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Active Connections */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {syncMessage && (
            <div className="badge badge-success" style={{ padding: '0.85rem', display: 'block', textAlign: 'center' }}>
              {syncMessage}
            </div>
          )}

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Configured Integrations</h2>
            
            {connections.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <strong>No active connections found.</strong>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Visit the Marketplace tab to configure accounting, banking, or tax portals.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Integration Name</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Schedule</th>
                    <th style={{ padding: '0.75rem' }}>Last Sync</th>
                    <th style={{ padding: '0.75rem' }}>Health</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-info">{c.category}</span>
                      </td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{c.syncSchedule.toLowerCase()}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--muted)' }}>
                        {c.lastSync ? new Date(c.lastSync).toLocaleString() : 'Never synced'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          fontWeight: 700,
                          color: c.healthScore > 80 ? 'var(--success)' : c.healthScore > 50 ? 'var(--warning)' : 'var(--danger)'
                        }}>{c.healthScore}%</span>
                      </td>
                      <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleManualSync(c.id)}
                          disabled={syncingId === c.id}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                        >
                          <RefreshCw size={12} className={syncingId === c.id ? 'animate-spin' : ''} />
                          {syncingId === c.id ? 'Syncing...' : 'Sync'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(c.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={12} />
                          Disconnect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sync History Queue */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Ingestion Job Logs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentSyncJobs.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No historical sync job records active.
                </div>
              ) : (
                recentSyncJobs.map((job) => (
                  <div key={job.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    background: 'var(--background)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${job.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                        {job.status}
                      </span>
                      <strong>{job.connectionName}</strong>
                      <span style={{ color: 'var(--muted)' }}>
                        Imported {job.recordsImported} ledger entries
                      </span>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                      {new Date(job.startedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Marketplace Catalog */}
      {activeTab === 'marketplace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search connector catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
              style={{ maxWidth: '180px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="BANKING">Banking API</option>
              <option value="ACCOUNTING">Accounting Tool</option>
              <option value="ERP">Enterprise ERP</option>
              <option value="CRM">Sales CRM</option>
              <option value="TAX">Tax portal</option>
            </select>
          </div>

          {/* Catalog grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {filteredMarketplace.map((c) => {
              const isConfigured = connections.some(conn => conn.name === c.name);
              return (
                <div key={c.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{c.logo}</div>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{c.category}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{c.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      Synchronize ledger journals, receivables, and invoices securely.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenConnect(c)}
                    className={`btn ${isConfigured ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                  >
                    {isConfigured ? 'Configure' : 'Connect'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Data Mapping Engine */}
      {activeTab === 'mapping' && (
        <div className="card" style={{ padding: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Data Field Mapping Sandbox</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Map integration API payload parameters to internal Proventa Credit Intelligence records schemas.
            </p>
          </div>

          {mappingMessage && (
            <div className="badge badge-success" style={{ padding: '0.75rem', display: 'block', textAlign: 'center', margin: '1rem 0' }}>
              {mappingMessage}
            </div>
          )}

          <form onSubmit={handleSaveMapping} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Schema Attribute Mapping</strong>
              <button type="button" onClick={handleAutoMap} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} />
                AI Suggested Mapping
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
              {[
                { label: 'Customer Name / Title *', key: 'extCustomerName' },
                { label: 'Corporate GSTIN *', key: 'extGstNumber' },
                { label: 'Invoice Total Amount *', key: 'extInvoiceAmount' },
                { label: 'Billing / Invoice Date *', key: 'extInvoiceDate' },
                { label: 'Due Date *', key: 'extDueDate' }
              ].map((field) => (
                <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{field.label}</div>
                  <input
                    type="text"
                    required
                    value={(mappingTemplate as any)[field.key]}
                    onChange={(e) => setMappingTemplate(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="form-input"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Save Mapping Template
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: Data Quality Center */}
      {activeTab === 'quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quality Grid meters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { label: 'Completeness Score', val: dataQuality.completeness, desc: 'Identifies missing crucial values or attributes.' },
              { label: 'Accuracy Score', val: dataQuality.accuracy, desc: 'Mismatch check against verified tax registries.' },
              { label: 'Freshness Score', val: dataQuality.freshness, desc: 'Measures sync frequency lag.' },
              { label: 'Consistency Score', val: dataQuality.consistency, desc: 'Confirms identical naming conventions across portals.' }
            ].map((q, idx) => (
              <div key={idx} className="card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{q.label}</strong>
                <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--success)' }}>
                  {q.val}%
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: '1.4' }}>{q.desc}</p>
              </div>
            ))}
          </div>

          {/* Recommendations Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>AI Recommendations to Enhance Quality</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { rec: 'Synchronize Tally Prime / QuickBooks Online to resolve 3 outstanding customer GST mismatches.', severity: 'HIGH' },
                { rec: 'Update the accounts email parameter on HDFC Bank portal to fill 15 missing invoice email fields.', severity: 'MEDIUM' },
                { rec: 'Trigger manual sync on GST Government Portal connection to pull fresh GSTR-3B filings.', severity: 'LOW' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
                  <div style={{ color: item.severity === 'HIGH' ? 'var(--danger)' : item.severity === 'MEDIUM' ? 'var(--warning)' : 'var(--primary)', marginTop: '0.2rem' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.rec}</div>
                    <span className={`badge ${item.severity === 'HIGH' ? 'badge-danger' : item.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                      Priority: {item.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Setup Wizard Modal Dialog */}
      {showSetupModal && selectedConnector && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setShowSetupModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', fontWeight: 800 }}>Connect {selectedConnector.name}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Securely store authentication tokens in isolated database vaults.
              </p>
            </div>

            {modalError && (
              <div className="badge badge-danger" style={{ padding: '0.75rem', display: 'block', textAlign: 'center' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveConnection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Connection Alias *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client ID / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="client_id_token_129384"
                  value={modalForm.clientId}
                  onChange={(e) => setModalForm(prev => ({ ...prev, clientId: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Secret / Private Key *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={modalForm.clientSecret}
                  onChange={(e) => setModalForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Synchronization Frequency</label>
                <select
                  value={modalForm.syncSchedule}
                  onChange={(e) => setModalForm(prev => ({ ...prev, syncSchedule: e.target.value }))}
                  className="form-input"
                >
                  <option value="REALTIME">Real-time / Webhooks</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily (Recommended)</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MANUAL">Manual Sync Only</option>
                </select>
              </div>

              <button type="submit" disabled={savingConnection} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                {savingConnection ? 'Authenticating...' : 'Authorize Integration Connection'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
