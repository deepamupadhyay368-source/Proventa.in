'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, LogOut, CheckCircle, AlertTriangle, RefreshCw, 
  Smartphone, Clock, Users, Eye, Database, ShieldAlert, History,
  Activity, Sliders, Play, Settings, Plus, X, Search, FileText,
  AlertCircle, Trash2, ArrowRight, Check, Server, EyeOff, LayoutGrid
} from 'lucide-react';

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<'hub' | 'explain' | 'workflows' | 'reconciliation' | 'governance' | 'observability'>('hub');
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    creditExposure: 145000,
    outstandingReceivables: 145000,
    outstandingPayables: 92800,
    averageDso: 32.5,
    healthScore: 98,
    activeIntegrations: 3,
    openTasks: 4
  });

  // State parameters
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const [reconciliationRecords, setReconciliationRecords] = useState<any[]>([]);
  const [reconciliationAnomalies, setReconciliationAnomalies] = useState<any[]>([]);
  const [dataCatalog, setDataCatalog] = useState<any[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('default');
  
  // Forms & Actions State
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: 'PAYMENT_DELAYED', action: 'NOTIFY_USER' });
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [reconciliationMessage, setReconciliationMessage] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '' });
  const [taskMessage, setTaskMessage] = useState('');
  const [governanceForm, setGovernanceForm] = useState({ category: 'Financial Documents', duration: '7 Years', action: 'ARCHIVE' });
  const [governanceMessage, setGovernanceMessage] = useState('');

  // Default AI Explainability state
  const defaultExplainCompany = {
    name: 'Alpha Logistics Inc',
    rating: 'AA',
    score: 746,
    confidence: 94,
    factors: [
      { name: 'Low Debt-to-Equity Gearing Ratio (1.2x)', weight: '+25pts' },
      { name: 'Strong liquidity position (1.5x)', weight: '+20pts' },
      { name: 'Clean governance and zero insolvency flags', weight: '+15pts' },
      { name: 'Active litigation records pending (Karnataka HC)', weight: '-10pts' }
    ],
    warnings: [
      'Missing Audited P&L statements for FY25.',
      'Average payment delays are rising in the logistics industry category.'
    ]
  };

  useEffect(() => {
    fetchWorkflows();
    fetchReconciliations();
    fetchGovernance();
    fetchTasks();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      if (res.ok) {
        const data = await res.json();
        
        // Populate aggregated exposure metrics dynamically
        if (data.portfolioMetrics) {
          setMetrics(prev => ({
            ...prev,
            creditExposure: data.portfolioMetrics.totalExposure || 145000,
            outstandingReceivables: data.portfolioMetrics.totalExposure || 145000,
            openTasks: data.notifications?.length || 0
          }));
        }

        const list = [];
        if (data.primaryCompany) {
          list.push(data.primaryCompany);
        }
        if (data.portfolioCompanies) {
          list.push(...data.portfolioCompanies);
        }
        setCompanies(list);
        if (list.length > 0) {
          setSelectedCompanyId(list[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/dashboard/workflows');
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.rules || []);
        setWorkflowRuns(data.runs || []);
      }
    } catch (e) {}
  };

  const fetchReconciliations = async () => {
    try {
      const res = await fetch('/api/dashboard/reconciliation');
      if (res.ok) {
        const data = await res.json();
        setReconciliationRecords(data.records || []);
        setReconciliationAnomalies(data.anomalies || []);
      }
    } catch (e) {}
  };

  const fetchGovernance = async () => {
    try {
      const res = await fetch('/api/dashboard/governance');
      if (res.ok) {
        const data = await res.json();
        setDataCatalog(data.dataCatalog || []);
        setRetentionPolicies(data.retentionPolicies || []);
      }
    } catch (e) {}
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/dashboard/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {}
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkflowMessage('');
    try {
      const res = await fetch('/api/dashboard/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflow.name,
          trigger: newWorkflow.trigger,
          actions: { type: newWorkflow.action }
        })
      });
      if (res.ok) {
        setWorkflowMessage('Workflow rule created successfully.');
        setNewWorkflow({ name: '', trigger: 'PAYMENT_DELAYED', action: 'NOTIFY_USER' });
        fetchWorkflows();
      } else {
        const err = await res.json();
        setWorkflowMessage(`Error: ${err.error || 'Failed to create workflow rule.'}`);
      }
    } catch (e) {
      setWorkflowMessage('Request failed.');
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    setWorkflowMessage('');
    try {
      const res = await fetch(`/api/dashboard/workflows?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setWorkflowMessage('Workflow rule removed successfully.');
        fetchWorkflows();
      } else {
        const err = await res.json();
        setWorkflowMessage(`Error: ${err.error || 'Failed to delete rule.'}`);
      }
    } catch (e) {}
  };

  const handleRunWorkflow = async (ruleId: string) => {
    setWorkflowMessage('');
    try {
      const res = await fetch('/api/dashboard/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId })
      });
      if (res.ok) {
        setWorkflowMessage('Workflow triggered successfully. Simulated run logs generated.');
        fetchWorkflows();
      }
    } catch (e) {}
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskMessage('');
    try {
      const res = await fetch('/api/dashboard/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate
        })
      });
      if (res.ok) {
        setTaskMessage('Task created and assigned successfully.');
        setTaskForm({ title: '', description: '', dueDate: '' });
        fetchTasks();
      }
    } catch (e) {}
  };

  const handleToggleTaskStatus = async (id: string, currentStatus: string) => {
    try {
      const res = await fetch('/api/dashboard/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: currentStatus === 'OPEN' ? 'COMPLETED' : 'OPEN'
        })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {}
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/tasks?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {}
  };

  const handleCreateGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    setGovernanceMessage('');
    try {
      const res = await fetch('/api/dashboard/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyCategory: governanceForm.category,
          policyDuration: governanceForm.duration,
          policyAction: governanceForm.action
        })
      });
      if (res.ok) {
        setGovernanceMessage('Data retention policy rule added successfully.');
        fetchGovernance();
      } else {
        const err = await res.json();
        setGovernanceMessage(`Error: ${err.error || 'Failed to update policy.'}`);
      }
    } catch (e) {}
  };

  const handleRunReconciliation = async () => {
    setReconciliationMessage('');
    try {
      const res = await fetch('/api/dashboard/reconciliation', {
        method: 'POST'
      });
      if (res.ok) {
        setReconciliationMessage('Reconciliation matching completed successfully. Discrepancies calculated.');
        fetchReconciliations();
      }
    } catch (e) {}
  };

  const handleResolveReconciliation = async (id: string) => {
    setReconciliationMessage('');
    try {
      const res = await fetch('/api/dashboard/reconciliation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setReconciliationMessage('Discrepancy successfully resolved in database.');
        fetchReconciliations();
      }
    } catch (e) {}
  };

  // Dynamic AI Explainability Resolver
  const getSelectedCompanyExplainability = () => {
    const found = companies.find(c => c.id === selectedCompanyId);
    if (!found) {
      return defaultExplainCompany;
    }

    const rating = found.assessment?.creditRating || 'BBB';
    const score = found.assessment?.creditScore || 685;
    const risk = found.assessment?.riskScore || 32;
    const litigationsCount = found.litigationsCount || 0;
    const revenue = found.annualRevenue || 12000000;

    const factors = [
      { name: `Industry segment: ${found.industry}`, weight: '+15pts' },
      { name: `Annual Revenue scale: ₹${(revenue / 100000).toFixed(1)} Lakhs`, weight: revenue > 10000000 ? '+25pts' : '+10pts' },
      { name: `Calculated default risk metrics: ${risk}%`, weight: risk > 45 ? '-20pts' : '+15pts' }
    ];

    if (litigationsCount > 0) {
      factors.push({ name: `Active civil disputes identified (${litigationsCount} cases)`, weight: `-${litigationsCount * 15}pts` });
    } else {
      factors.push({ name: 'Clean governance and zero insolvency registry flags', weight: '+15pts' });
    }

    const warnings = [];
    if (litigationsCount > 0) {
      warnings.push(`GST/ROC Flags: Company has ${litigationsCount} active civil lawsuits.`);
    }
    if (score < 650) {
      warnings.push('Credit health score falls below optimal sector threshold.');
    }
    if (warnings.length === 0) {
      warnings.push('All standard data records reconciled successfully.');
    }

    return {
      name: found.name,
      rating,
      score,
      confidence: Math.round(98 - risk / 2),
      factors,
      warnings
    };
  };

  const activeExplainability = getSelectedCompanyExplainability();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutGrid size={32} style={{ color: 'var(--primary)' }} />
          Executive Command Center
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          AI Intelligence cockpit: monitor portfolio risks, configure rule automations, matching reconciliations, and platform health.
        </p>
      </div>

      {/* Overview Metrics Cards */}
      <div className="dashboard-grid">
        <div className="card col-3">
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>TOTAL CREDIT EXPOSURE</div>
          <strong className="number-mono" style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>
            ₹{metrics.creditExposure.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="card col-3">
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ACCOUNTS RECEIVABLE</div>
          <strong className="number-mono" style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem', color: 'var(--warning)' }}>
            ₹{metrics.outstandingReceivables.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="card col-3">
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ACCOUNTS PAYABLE</div>
          <strong className="number-mono" style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem', color: 'var(--primary)' }}>
            ₹{metrics.outstandingPayables.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="card col-3">
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>PORTFOLIO AVERAGE DSO</div>
          <strong className="number-mono" style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem', color: 'var(--success)' }}>
            {metrics.averageDso} Days
          </strong>
        </div>
      </div>

      {/* Navigation Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'hub', label: 'Overview Hub', icon: <LayoutGrid size={16} /> },
          { id: 'explain', label: 'AI Explainability', icon: <Eye size={16} /> },
          { id: 'workflows', label: 'Workflow Engine', icon: <Sliders size={16} /> },
          { id: 'reconciliation', label: 'Reconciliation', icon: <RefreshCw size={16} /> },
          { id: 'governance', label: 'Data Governance', icon: <Database size={16} /> },
          { id: 'observability', label: 'Observability Console', icon: <Server size={16} /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', borderRadius: '10px' }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview Hub */}
      {activeTab === 'hub' && (
        <div className="dashboard-grid">
          {/* Left: Alerts & Tasks */}
          <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Active alerts panel */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} style={{ color: 'var(--warning)' }} />
                Real-Time Risk Alerts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ color: 'var(--danger)', marginTop: '0.15rem' }}><AlertTriangle size={18} /></div>
                  <div>
                    <strong>Alpha Logistics Inc: Average payment delays increased</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>AI predictive model flags high default risks within the manufacturing sector.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ color: 'var(--warning)', marginTop: '0.15rem' }}><AlertTriangle size={18} /></div>
                  <div>
                    <strong>Reconciliation Anomaly Detected: GST portal mismatch</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Ledger records mismatch observed during GSTR-1 government audits comparison.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Task panel */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Open Collaborative Tasks</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No pending tasks assigned.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleToggleTaskStatus(task.id, task.status)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: task.status === 'COMPLETED' ? 'var(--success)' : 'var(--muted)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={task.status === 'COMPLETED' ? 'Mark Open' : 'Mark Completed'}
                          >
                            <CheckCircle size={16} style={{ fill: task.status === 'COMPLETED' ? 'var(--success-bg)' : 'none' }} />
                          </button>
                          <strong style={{ textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', color: task.status === 'COMPLETED' ? 'var(--muted)' : 'inherit' }}>
                            {task.title}
                          </strong>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '1.5rem' }}>{task.description || 'No description provided'}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                          title="Delete Task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick task assign */}
          <div className="card col-4" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Create Collaboration Task</h2>
            {taskMessage && (
              <div className="badge badge-success" style={{ padding: '0.5rem', textAlign: 'center', display: 'block', marginBottom: '1rem', width: '100%' }}>
                {taskMessage}
              </div>
            )}
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Audit missing invoice #1203"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Verify discrepancy flagged during reconciliations..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px', textTransform: 'none' }}>
                Assign Task Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Explainability */}
      {activeTab === 'explain' && (
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Explainable AI (XAI) Model Reasoning</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                Proventa AI transparency: review the weights, scoring components, and confidence levels backing decision models.
              </p>
            </div>

            {/* Dynamic Target Selector */}
            <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
              <label className="form-label">Select Company Target</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="form-input"
                style={{ borderRadius: '10px', padding: '0.5rem 1rem' }}
              >
                <option value="default">Alpha Logistics Inc (Sample)</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <strong>Active Credit Decision Target</strong>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  {activeExplainability.name}
                </div>
              </div>

              {/* Contributing factors weights list */}
              <div>
                <strong>Contributing Score Factors</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {activeExplainability.factors.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--background)' }}>
                      <span>{f.name}</span>
                      <strong style={{ color: f.weight.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                        {f.weight}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Confidence Meter */}
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--background)' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>MODEL CONFIDENCE SCORE</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  {activeExplainability.confidence}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Derived using 4 high-quality data feeds.
                </div>
              </div>

              {/* Data quality warnings */}
              <div>
                <strong>Missing Data / Risk Warnings</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {activeExplainability.warnings.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <div style={{ color: 'var(--warning)', marginTop: '0.1rem' }}><AlertTriangle size={14} /></div>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Workflow Designer */}
      {activeTab === 'workflows' && (
        <div className="dashboard-grid">
          
          {/* Rule config creation form */}
          <div className="card col-5" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Automation Rule</h2>
            {workflowMessage && (
              <div className="badge badge-success" style={{ padding: '0.5rem', textAlign: 'center', display: 'block', marginBottom: '1rem', width: '100%' }}>
                {workflowMessage}
              </div>
            )}
            <form onSubmit={handleCreateWorkflow} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Workflow Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Escalate severe payment delay alerts"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trigger Event</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                >
                  <option value="PAYMENT_DELAYED">Payment Delayed (DSO Exceeded)</option>
                  <option value="NEW_INVOICE">New Customer Invoice Registered</option>
                  <option value="CREDIT_LIMIT_EXCEEDED">Credit Exposure Limit Exceeded</option>
                  <option value="GST_UPDATE">GST Tax Update Ingestion</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Action Outcome</label>
                <select
                  value={newWorkflow.action}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, action: e.target.value }))}
                  className="form-input"
                  style={{ borderRadius: '10px' }}
                >
                  <option value="NOTIFY_USER">Send Slack/In-App Security Alert</option>
                  <option value="RUN_AI_ANALYSIS">Execute AI Credit Scoring Recalculation</option>
                  <option value="CREATE_TASK">Spawn Collaborative Team Task Ticket</option>
                  <option value="SEND_EMAIL">Dispatch Audit Escalation Email</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px', textTransform: 'none' }}>
                Deploy Automation Rule
              </button>
            </form>
          </div>

          {/* Active workflow rules list */}
          <div className="col-7" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Active Rule Mappings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workflows.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No automation rules configured.</p>
                ) : (
                  workflows.map((wf) => (
                    <div key={wf.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{wf.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleRunWorkflow(wf.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', textTransform: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                            title="Run Trigger"
                          >
                            <Play size={12} /> Run
                          </button>
                          <button 
                            onClick={() => handleDeleteWorkflow(wf.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.25rem' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                            title="Remove Rule"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        Trigger: {wf.trigger} | Action: {JSON.parse(wf.actions).type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Run logs */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Execution History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workflowRuns.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No runs recorded yet.</p>
                ) : (
                  workflowRuns.map((run) => (
                    <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.4rem' }}>
                      <span>Run ID: {run.id.substring(0, 8)}</span>
                      <strong style={{ color: 'var(--success)' }}>{run.status}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Reconciliation Matching */}
      {activeTab === 'reconciliation' && (
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Financial Reconciliation Engine</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                Compare bank statements vs ledgers and tax registries. AI flags anomalies and outputs resolution parameters.
              </p>
            </div>
            <button onClick={handleRunReconciliation} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', textTransform: 'none' }}>
              <Play size={14} />
              Run Reconciliation Audit
            </button>
          </div>

          {reconciliationMessage && (
            <div className="badge badge-success" style={{ padding: '0.75rem', textAlign: 'center', display: 'block', width: '100%' }}>
              {reconciliationMessage}
            </div>
          )}

          {/* Reconciliation table */}
          <div className="table-container">
            <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '1rem' }}>Match Registry Logs</strong>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Match Category</th>
                  <th>Source Amt</th>
                  <th>Target Amt</th>
                  <th>Discrepancy</th>
                  <th>Status</th>
                  <th>Action Outcome</th>
                </tr>
              </thead>
              <tbody>
                {reconciliationRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No reconciliation audits run yet. Click Run Reconciliation Audit above to start.
                    </td>
                  </tr>
                ) : (
                  reconciliationRecords.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.type.replace(/_/g, ' ')}</td>
                      <td className="number-mono">₹{r.sourceAmount.toLocaleString('en-IN')}</td>
                      <td className="number-mono">₹{r.targetAmount.toLocaleString('en-IN')}</td>
                      <td className="number-mono" style={{ color: r.difference > 0 ? 'var(--danger)' : 'inherit' }}>
                        ₹{r.difference.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'MATCHED' ? 'badge-success' : r.status === 'RESOLVED' ? 'badge-info' : 'badge-danger'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.suggestedResolution || 'Perfect match alignment.'}</span>
                          {r.status === 'ANOMALY' && (
                            <button 
                              onClick={() => handleResolveReconciliation(r.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ alignSelf: 'flex-start', padding: '0.2rem 0.5rem', textTransform: 'none', fontSize: '0.7rem', borderRadius: '6px', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Check size={11} /> Resolve Discrepancy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Data Governance */}
      {activeTab === 'governance' && (
        <div className="dashboard-grid">
          
          {/* Data warehouse inventory catalog */}
          <div className="card col-7" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Data Warehouse Catalog</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dataCatalog.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <strong>{cat.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      Storage Size: {cat.size} | Total Items: {cat.items}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>
                    {cat.classification}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention policies config */}
          <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Update Retention Policy</h2>
              {governanceMessage && (
                <div className="badge badge-success" style={{ padding: '0.5rem', textAlign: 'center', display: 'block', marginBottom: '1rem', width: '100%' }}>
                  {governanceMessage}
                </div>
              )}
              <form onSubmit={handleCreateGovernance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Data Category</label>
                  <select
                    value={governanceForm.category}
                    onChange={(e) => setGovernanceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="Financial Documents">Financial Documents Vault</option>
                    <option value="Session Track Logs">Session Track Logs</option>
                    <option value="Credit Scores Snapshots">Credit Scores Snapshots</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Retention Duration</label>
                  <select
                    value={governanceForm.duration}
                    onChange={(e) => setGovernanceForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="form-input"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="90 Days">90 Days</option>
                    <option value="3 Years">3 Years</option>
                    <option value="7 Years">7 Years (Standard)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Action on Expiry</label>
                  <select
                    value={governanceForm.action}
                    onChange={(e) => setGovernanceForm(prev => ({ ...prev, action: e.target.value }))}
                    className="form-input"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="ARCHIVE">Archive to Deep Cold Vault</option>
                    <option value="PURGE">Hard Purge and Delete</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '10px', textTransform: 'none' }}>
                  Save Policy Parameter
                </button>
              </form>
            </div>

            {/* Active policies list */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.75rem' }}>Active Retention Rules</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {retentionPolicies.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.4rem' }}>
                    <span>{p.category}</span>
                    <strong style={{ color: 'var(--primary)' }}>{p.duration} ({p.action})</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: Observability */}
      {activeTab === 'observability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Performance Counters */}
          <div className="dashboard-grid">
            {[
              { label: 'API Gateway Latency', val: '24ms', desc: 'Average endpoints response cycle.' },
              { label: 'Ingestion Error Rate', val: '0.00%', desc: 'Failed API sync events count.' },
              { label: 'AI Processing Queue', val: '0 jobs', desc: 'Active scoring jobs waiting.' },
              { label: 'Db Transaction Load', val: '12ms', desc: 'Average SQLite query execution time.' }
            ].map((perf, idx) => (
              <div key={idx} className="card col-3" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>{perf.label}</strong>
                <div className="number-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  {perf.val}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: '1.4' }}>{perf.desc}</p>
              </div>
            ))}
          </div>

          {/* Health Status Dashboard */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Integration API Performance Metrics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Government GSTIN Portal API Connection', uptime: '99.98%', status: 'HEALTHY' },
                { name: 'QuickBooks OAuth Token Refresh Endpoint', uptime: '100.00%', status: 'HEALTHY' },
                { name: 'HDFC Banking API Webhook Listener', uptime: '99.94%', status: 'HEALTHY' }
              ].map((serv, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <strong>{serv.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      Historical Uptime: {serv.uptime}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>
                    {serv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
