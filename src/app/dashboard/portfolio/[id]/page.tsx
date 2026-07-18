"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, MapPin, Briefcase, Phone, Mail, FileText, 
  AlertTriangle, CheckCircle2, Info, ArrowUpRight, Clock, 
  Activity, TrendingUp, TrendingDown, ShieldAlert, Zap
} from 'lucide-react';

// Mock Data for the company profile
const companyData = {
  id: "comp_98242",
  name: "Soylent Corp",
  industry: "Manufacturing",
  website: "soylentcorp.com",
  location: "Neo City, Sector 4",
  riskScore: 92,
  status: "Critical",
  creditLimit: 500000,
  outstanding: 210000,
  dso: 65,
};

// Event types for the timeline
type EventType = 'info' | 'warning' | 'critical' | 'success';

interface CompanyEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  title: string;
  description: string;
  source: string;
}

const initialEvents: CompanyEvent[] = [
  {
    id: "evt_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    type: "critical",
    title: "Missed Payment Notification",
    description: "Invoice #INV-2024-089 is now 15 days past due.",
    source: "ERP Sync",
  },
  {
    id: "evt_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    type: "warning",
    title: "Credit Utilization Alert",
    description: "Company has utilized 85% of their approved credit limit.",
    source: "Risk Engine",
  },
  {
    id: "evt_3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: "info",
    title: "Leadership Change Detected",
    description: "CFO position updated on LinkedIn. Previous CFO departed after 8 months.",
    source: "Web Scraper",
  },
  {
    id: "evt_4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    type: "success",
    title: "Payment Received",
    description: "Payment of $45,000 received for Invoice #INV-2024-042.",
    source: "Banking API",
  }
];

export default function CompanyPortfolioPage({ params }: { params: { id: string } }) {
  const [events, setEvents] = useState<CompanyEvent[]>(initialEvents);
  
  // Simulate real-time monitoring engine generating events
  useEffect(() => {
    const timer = setInterval(() => {
      // 10% chance to generate a new event every 5 seconds
      if (Math.random() > 0.9) {
        const newEvent: CompanyEvent = {
          id: `evt_auto_${Date.now()}`,
          timestamp: new Date(),
          type: Math.random() > 0.7 ? "warning" : "info",
          title: "Real-time Web Signal Detected",
          description: "Unusual sentiment shift in recent industry news regarding supply chain constraints.",
          source: "News API Agent",
        };
        setEvents(prev => [newEvent, ...prev]);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'critical': return <ShieldAlert size={18} className="text-rose-400" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-400" />;
      case 'success': return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'info': default: return <Info size={18} className="text-indigo-400" />;
    }
  };

  const getEventBg = (type: EventType) => {
    switch (type) {
      case 'critical': return 'bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'info': default: return 'bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
          <span className="hover:text-slate-300 cursor-pointer">Portfolio</span>
          <span>/</span>
          <span className="text-indigo-400 font-medium">{companyData.name}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg">
              <Building2 size={32} className="text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {companyData.name}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                  {companyData.status}
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Globe size={14} /> {companyData.website}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {companyData.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} /> {companyData.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-all text-sm font-medium">
              View ERP Data
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all text-sm font-medium">
              Request Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Risk Card */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
              <Activity size={18} /> Credit Risk Score
            </h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-bold text-white tracking-tight">{companyData.riskScore}</span>
              <span className="text-sm text-slate-500 mb-1">/ 100</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-[92%]"></div>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <TrendingUp size={12} className="text-rose-400" /> Score worsened by 14 pts in 30 days
            </p>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
            <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
              <FileText size={18} /> Financial Exposure
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1 flex justify-between">
                  <span>Outstanding Balance</span>
                  <span className="text-slate-300 font-medium">${companyData.outstanding.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[42%]"></div>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1 flex justify-between">
                  <span>Credit Limit</span>
                  <span className="text-slate-300 font-medium">${companyData.creditLimit.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center">
                <span className="text-sm text-slate-500">Average DSO</span>
                <span className="text-lg font-semibold text-rose-400">{companyData.dso} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Company Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 h-full min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Zap size={20} className="text-indigo-400" />
                Real-Time Event Engine
              </h2>
              <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Monitoring Active
              </div>
            </div>

            <div className="flex-grow relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-6 top-4 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-800 to-transparent"></div>
              
              <div className="space-y-6 relative">
                {events.map((event, index) => (
                  <div key={event.id} className="flex gap-4 relative animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Icon Node */}
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[#0a0a0a] border-4 border-[#0a0a0a] flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getEventBg(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                    </div>
                    
                    {/* Event Content */}
                    <div className="pt-2 pb-4 flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-base font-semibold text-slate-200">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                          <Clock size={12} />
                          {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 
                          {' - '}
                          {event.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{event.description}</p>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 font-medium">
                        Source: <span className="text-slate-300">{event.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
