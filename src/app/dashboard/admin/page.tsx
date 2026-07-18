"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Settings, Users, Shield, Activity, Key, ToggleRight, 
  Search, Plus, MoreVertical, Server, ArrowUpRight, Zap, CheckCircle2
} from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'Alice Chen', email: 'alice@proventa.ai', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: '2', name: 'Bob Smith', email: 'bob@proventa.ai', role: 'Risk Analyst', status: 'Active', lastActive: '1 hour ago' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@proventa.ai', role: 'Collections', status: 'Inactive', lastActive: '5 days ago' },
  { id: '4', name: 'Diana Prince', email: 'diana@proventa.ai', role: 'Manager', status: 'Active', lastActive: '10 mins ago' },
];

const apiUsageData = [
  { time: '00:00', calls: 1200 },
  { time: '04:00', calls: 900 },
  { time: '08:00', calls: 3400 },
  { time: '12:00', calls: 5200 },
  { time: '16:00', calls: 4800 },
  { time: '20:00', calls: 2100 },
];

export default function AdminCenter() {
  const [activeTab, setActiveTab] = useState('rbac');
  const [users, setUsers] = useState<any[]>(mockUsers);
  const [loading, setLoading] = useState(false);

  // In a real scenario we'd fetch settings and users here:
  // useEffect(() => { ... }, []);

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all font-medium text-sm ${
        activeTab === id 
        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-8 font-sans selection:bg-indigo-500/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">
            Admin Center
          </h1>
          <p className="text-slate-400 mt-1">Manage organization settings, users, and infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-all backdrop-blur-sm">
            <Settings size={16} />
            <span>Org Settings</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-medium">
            <Plus size={16} />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 overflow-x-auto no-scrollbar">
        <TabButton id="rbac" label="Users & RBAC" icon={Users} />
        <TabButton id="api" label="API Usage" icon={Activity} />
        <TabButton id="flags" label="Feature Flags" icon={ToggleRight} />
        <TabButton id="security" label="Security" icon={Shield} />
      </div>

      <div className="space-y-8">
        {/* RBAC Tab Content */}
        {activeTab === 'rbac' && (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-800/60 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Shield className="text-indigo-400" size={20} />
                Role-Based Access Control
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200 w-64 placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/30 text-slate-400 text-sm">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Last Active</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">{user.name}</div>
                            <div className="text-slate-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                          <span className={user.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'}>{user.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{user.lastActive}</td>
                      <td className="p-4 text-right">
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API Usage Tab Content */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="text-cyan-400" size={20} />
                  API Requests (24h)
                </h2>
                <div className="text-2xl font-bold text-white">17.6k</div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="calls" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Key className="text-purple-400" size={18} />
                  Active API Keys
                </h3>
                <div className="space-y-3">
                  {['Production Key', 'Staging App', 'Zapier Integration'].map((key, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{key}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">pk_live_••••{1234 + i}</div>
                      </div>
                      <button className="text-slate-400 hover:text-indigo-400 transition-colors text-xs font-medium">Revoke</button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <Plus size={14} /> Generate New Key
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-indigo-400 font-medium text-sm mb-1">System Status</h3>
                    <div className="text-white text-xl font-semibold flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={20} />
                      All Systems Operational
                    </div>
                  </div>
                  <Server className="text-indigo-500/50" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Flags Tab Content */}
        {activeTab === 'flags' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { id: 'ff-1', name: 'New Credit Scoring Model v2', desc: 'Use the experimental ML model for credit risk assessment', enabled: true, tags: ['ML', 'Beta'] },
              { id: 'ff-2', name: 'Real-time ERP Sync', desc: 'Continuous background syncing with Netsuite/SAP', enabled: true, tags: ['Integration'] },
              { id: 'ff-3', name: 'AI Collection Agent', desc: 'Automated conversational outreach for late invoices', enabled: false, tags: ['AI', 'Alpha'] },
              { id: 'ff-4', name: 'Dark Mode Enforce', desc: 'Force all users to use dark mode', enabled: false, tags: ['UI'] },
              { id: 'ff-5', name: 'Advanced Cash Flow Forecasting', desc: 'Monte Carlo simulations for 90-day cash flow', enabled: true, tags: ['Premium', 'Analytics'] },
            ].map((flag) => (
              <div key={flag.id} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 flex flex-col h-full group hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 text-indigo-400">
                    <Zap size={18} />
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${flag.enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">{flag.name}</h3>
                <p className="text-slate-400 text-sm mb-4 flex-grow">{flag.desc}</p>
                <div className="flex gap-2 mt-auto">
                  {flag.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-slate-800 text-slate-400 border border-slate-700/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
