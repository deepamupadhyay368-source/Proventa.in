"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, LineChart, Line
} from 'recharts';
import { 
  AlertCircle, ArrowDownRight, ArrowUpRight, Clock, 
  DollarSign, Filter, RefreshCcw, Search, ShieldAlert, 
  TrendingDown, Users, Download, MoreHorizontal, BellRing
} from 'lucide-react';

const fallbackCustomers = [
  { id: '1', name: 'Acme Corp', riskScore: 85, balance: 125000, status: 'high-risk' },
  { id: '2', name: 'Globex Inc', riskScore: 65, balance: 45000, status: 'medium-risk' },
  { id: '3', name: 'Soylent Corp', riskScore: 92, balance: 210000, status: 'critical' },
  { id: '4', name: 'Initech', riskScore: 42, balance: 12000, status: 'low-risk' },
  { id: '5', name: 'Umbrella Corp', riskScore: 78, balance: 85000, status: 'high-risk' },
];

const agingData = [
  { name: 'Current', amount: 450000, fill: '#10b981' },
  { name: '1-30 Days', amount: 210000, fill: '#f59e0b' },
  { name: '31-60 Days', amount: 125000, fill: '#f97316' },
  { name: '61-90 Days', amount: 75000, fill: '#ef4444' },
  { name: '90+ Days', amount: 42000, fill: '#991b1b' },
];

const dsoTrend = [
  { month: 'Jan', dso: 45 },
  { month: 'Feb', dso: 43 },
  { month: 'Mar', dso: 46 },
  { month: 'Apr', dso: 42 },
  { month: 'May', dso: 38 },
  { month: 'Jun', dso: 35 },
];

export default function CollectionsDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, invRes] = await Promise.all([
          fetch('/api/dashboard/customers').catch(() => null),
          fetch('/api/dashboard/invoices').catch(() => null)
        ]);
        
        const custData = custRes?.ok ? await custRes.json() : fallbackCustomers;
        const invData = invRes?.ok ? await invRes.json() : [];
        
        setCustomers(Array.isArray(custData) && custData.length > 0 ? custData : fallbackCustomers);
        setInvoices(Array.isArray(invData) ? invData : []);
      } catch (error) {
        console.error("Error fetching collections data:", error);
        setCustomers(fallbackCustomers);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-8 font-sans selection:bg-indigo-500/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Collections & Aging
          </h1>
          <p className="text-slate-400 mt-1">Monitor outstanding balances and customer risk profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-all backdrop-blur-sm">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-medium">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Outstanding", value: "$902,000", icon: DollarSign, trend: "+2.4%", trendUp: false, color: "text-indigo-400" },
          { label: "Avg DSO", value: "35 Days", icon: Clock, trend: "-3 Days", trendUp: true, color: "text-cyan-400" },
          { label: "At Risk Balance", value: "$117,000", icon: ShieldAlert, trend: "+12.5%", trendUp: false, color: "text-rose-400" },
          { label: "Collection Rate", value: "94.2%", icon: TrendingDown, trend: "+1.2%", trendUp: true, color: "text-emerald-400" },
        ].map((metric, i) => (
          <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-800/50 ${metric.color}`}>
                <metric.icon size={22} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trendUp ? 'text-emerald-400' : 'text-rose-400'} bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800/50`}>
                {metric.trendUp ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{metric.label}</h3>
            <p className="text-3xl font-bold text-white mt-1 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Aging Bucket Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Accounts Receivable Aging</h2>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSO Trend */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">DSO Trend</h2>
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
              <TrendingDown size={12} />
              <span>Improving</span>
            </div>
          </div>
          <div className="h-[260px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dsoTrend} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="dso" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorDso)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertCircle className="text-rose-400" size={20} />
            Highest Risk Customers
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200 w-full sm:w-64 placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-sm">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Risk Score</th>
                <th className="p-4 font-medium">Outstanding Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {customers.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{customer.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            customer.riskScore > 80 ? 'bg-rose-500' : 
                            customer.riskScore > 60 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${customer.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={
                        customer.riskScore > 80 ? 'text-rose-400' : 
                        customer.riskScore > 60 ? 'text-orange-400' : 'text-emerald-400'
                      }>{customer.riskScore}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-mono">${customer.balance.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      customer.status === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      customer.status === 'high-risk' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      customer.status === 'medium-risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {customer.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Send Reminder">
                      <BellRing size={16} />
                    </button>
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors ml-1" title="More Options">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
