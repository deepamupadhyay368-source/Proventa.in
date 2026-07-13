'use client';

import React, { useState } from 'react';
import { ShieldCheck, BarChart3, TrendingUp, TrendingDown, Info, ArrowUpRight } from 'lucide-react';

const INDUSTRIES = ['Manufacturing', 'Logistics', 'Technology', 'Wholesale', 'Services', 'Healthcare', 'Retail'];

const BENCHMARKS: Record<string, any> = {
  Manufacturing: { dso: 45, currentRatio: 1.5, grossMargin: 25, revGrowth: 12, defaultRate: 2.1 },
  Logistics: { dso: 60, currentRatio: 1.2, grossMargin: 15, revGrowth: 18, defaultRate: 3.5 },
  Technology: { dso: 30, currentRatio: 2.1, grossMargin: 65, revGrowth: 35, defaultRate: 0.8 },
  Wholesale: { dso: 40, currentRatio: 1.3, grossMargin: 18, revGrowth: 10, defaultRate: 2.8 },
  Services: { dso: 35, currentRatio: 1.8, grossMargin: 45, revGrowth: 15, defaultRate: 1.5 },
  Healthcare: { dso: 50, currentRatio: 1.6, grossMargin: 40, revGrowth: 8, defaultRate: 1.2 },
  Retail: { dso: 15, currentRatio: 1.1, grossMargin: 30, revGrowth: 20, defaultRate: 4.5 },
};

// Simulated user metrics
const USER_METRICS = { dso: 42, currentRatio: 1.4, grossMargin: 28, revGrowth: 14, defaultRate: 1.8 };

export default function BenchmarkingPage() {
  const [industry, setIndustry] = useState('Manufacturing');
  const b = BENCHMARKS[industry];

  const getPercentile = (val: number, median: number, invert: boolean = false) => {
    const diff = ((val - median) / median) * 100;
    let p = 50 + diff;
    if (invert) p = 50 - diff;
    return Math.max(1, Math.min(99, Math.round(p)));
  };

  const metrics = [
    { label: 'Days Sales Outstanding (DSO)', user: USER_METRICS.dso, median: b.dso, unit: ' days', invert: true },
    { label: 'Current Ratio', user: USER_METRICS.currentRatio, median: b.currentRatio, unit: 'x', invert: false },
    { label: 'Gross Margin', user: USER_METRICS.grossMargin, median: b.grossMargin, unit: '%', invert: false },
    { label: 'Revenue Growth', user: USER_METRICS.revGrowth, median: b.revGrowth, unit: '%', invert: false },
    { label: 'Default Rate', user: USER_METRICS.defaultRate, median: b.defaultRate, unit: '%', invert: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
            Industry Benchmarking
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Compare your financial and credit performance against peers in your sector.
          </p>
        </div>
        <select 
          className="form-input" 
          style={{ width: '250px' }}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          {INDUSTRIES.map(i => <option key={i} value={i}>{i} Sector</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {metrics.map((m, i) => {
          const percentile = getPercentile(m.user, m.median, m.invert);
          const isGood = percentile >= 50;
          return (
            <div key={i} className="card card-hover" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '1rem' }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>YOU</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)' }}>{m.user}{m.unit}</div>
                </div>
                <div style={{ paddingBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>MEDIAN</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--muted)' }}>{m.median}{m.unit}</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: isGood ? 'var(--success)' : 'var(--warning)' }}>
                  <span>{percentile}th Percentile</span>
                  <span>{isGood ? 'Above Average' : 'Needs Work'}</span>
                </div>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentile}%`, background: isGood ? 'var(--success)' : 'var(--warning)' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
          AI Performance Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '1rem' }}>
            <Info size={24} style={{ color: 'var(--info)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--info)' }}>DSO Optimization Required</strong>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Your DSO of 42 days is better than the industry median (45 days), but top quartile performers are at 32 days. Automating reminders could help close this gap.</p>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '1rem' }}>
            <TrendingUp size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--success)' }}>Strong Default Resilience</strong>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Your default rate of 1.8% is significantly lower than the sector median of {b.defaultRate}%. Your strict credit policies are paying off.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
