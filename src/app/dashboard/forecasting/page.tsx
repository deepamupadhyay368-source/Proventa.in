'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';

type ForecastType = 'revenue' | 'cashflow' | 'dso' | 'risk';
type ForecastPeriod = '3M' | '6M' | '12M';

const TYPE_CONFIG = {
  revenue: { label: 'Revenue', color: '#2563EB', unit: '₹L' },
  cashflow: { label: 'Cash Flow', color: '#10B981', unit: '₹L' },
  dso: { label: 'DSO', color: '#F59E0B', unit: 'days' },
  risk: { label: 'Default Risk', color: '#EF4444', unit: '%' },
};

function formatValue(val: number, type: ForecastType): string {
  if (type === 'revenue' || type === 'cashflow') {
    return `₹${(Math.abs(val) / 100000).toFixed(1)}L${val < 0 ? ' (deficit)' : ''}`;
  }
  if (type === 'dso') return `${Math.round(val)}d`;
  return `${val.toFixed(1)}%`;
}

function ForecastChart({ dataPoints, type }: { dataPoints: any[]; type: ForecastType }) {
  const config = TYPE_CONFIG[type];
  if (!dataPoints || dataPoints.length === 0) return null;

  const WIDTH = 700;
  const HEIGHT = 280;
  const PADDING = { top: 20, right: 20, bottom: 50, left: 70 };
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const allValues = dataPoints.flatMap(d => [d.projected, d.actual].filter(Boolean));
  const minVal = Math.min(...allValues) * (Math.min(...allValues) < 0 ? 1.1 : 0.9);
  const maxVal = Math.max(...allValues) * 1.1;
  const valRange = maxVal - minVal || 1;

  const xScale = (i: number) => PADDING.left + (i / (dataPoints.length - 1)) * chartW;
  const yScale = (v: number) => PADDING.top + chartH - ((v - minVal) / valRange) * chartH;

  // Build projected path
  const projPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.projected).toFixed(1)}`).join(' ');

  // Build actual path (only where actual exists)
  const actualPoints = dataPoints.filter(d => d.actual !== undefined);
  const actPath = actualPoints.map((d, i) => {
    const idx = dataPoints.indexOf(d);
    return `${i === 0 ? 'M' : 'L'}${xScale(idx).toFixed(1)},${yScale(d.actual).toFixed(1)}`;
  }).join(' ');

  // Confidence band
  const bandPath = [
    ...dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.projected * (1 + (1 - d.confidence) * 0.15)).toFixed(1)}`),
    ...dataPoints.slice().reverse().map((d, i) => `L${xScale(dataPoints.length - 1 - i).toFixed(1)},${yScale(d.projected * (1 - (1 - d.confidence) * 0.15)).toFixed(1)}`),
    'Z',
  ].join(' ');

  // Y axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => minVal + (i / (yTicks - 1)) * valRange);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={WIDTH} height={HEIGHT} style={{ display: 'block', maxWidth: '100%' }}>
        {/* Grid lines */}
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PADDING.left} y1={yScale(v).toFixed(1)}
              x2={PADDING.left + chartW} y2={yScale(v).toFixed(1)}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4"
            />
            <text x={PADDING.left - 8} y={parseFloat(yScale(v).toFixed(1)) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
              {type === 'revenue' || type === 'cashflow'
                ? `₹${(v / 100000).toFixed(0)}L`
                : type === 'dso'
                  ? `${Math.round(v)}d`
                  : `${v.toFixed(1)}%`}
            </text>
          </g>
        ))}

        {/* Confidence band */}
        <path d={bandPath} fill={config.color} opacity="0.08" />

        {/* Projected line (dashed) */}
        <path d={projPath} fill="none" stroke={config.color} strokeWidth="2.5" strokeDasharray="6,4" opacity="0.85" />

        {/* Actual line (solid) */}
        {actPath && <path d={actPath} fill="none" stroke={config.color} strokeWidth="3" />}

        {/* Data point circles */}
        {dataPoints.map((d, i) => (
          <g key={i}>
            {/* Projected point */}
            <circle cx={xScale(i)} cy={yScale(d.projected)} r="4" fill={config.color} opacity="0.7" stroke="#fff" strokeWidth="1.5">
              <title>{`${d.month}: Projected ${formatValue(d.projected, type)} (${Math.round(d.confidence * 100)}% confidence)`}</title>
            </circle>
            {/* Actual point */}
            {d.actual !== undefined && (
              <circle cx={xScale(i)} cy={yScale(d.actual)} r="5" fill={config.color} stroke="#fff" strokeWidth="2">
                <title>{`${d.month}: Actual ${formatValue(d.actual, type)}`}</title>
              </circle>
            )}
            {/* X axis label */}
            <text
              x={xScale(i)} y={HEIGHT - 10}
              textAnchor="middle" fontSize="10" fill="var(--muted)"
              transform={`rotate(-35, ${xScale(i)}, ${HEIGHT - 10})`}
            >
              {d.month}
            </text>
          </g>
        ))}

        {/* Zero line for cashflow */}
        {type === 'cashflow' && minVal < 0 && maxVal > 0 && (
          <line
            x1={PADDING.left} y1={yScale(0)}
            x2={PADDING.left + chartW} y2={yScale(0)}
            stroke="#EF4444" strokeWidth="1.5" strokeDasharray="8,4"
          />
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke={config.color} strokeWidth="2.5" /></svg>
          Actual
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke={config.color} strokeWidth="2" strokeDasharray="5,3" /></svg>
          Projected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
          <div style={{ width: '24px', height: '12px', background: config.color, opacity: 0.15, borderRadius: '2px' }} />
          Confidence Band
        </div>
      </div>
    </div>
  );
}

export default function ForecastingPage() {
  const [type, setType] = useState<ForecastType>('revenue');
  const [period, setPeriod] = useState<ForecastPeriod>('6M');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/forecasting?type=${type}&period=${period}`);
      if (!res.ok) throw new Error('Failed to generate forecast');
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, period]);

  const config = TYPE_CONFIG[type];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
              AI Financial Forecasting
            </h1>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
            Powered by Proventa AI Engine — predictive intelligence for your financial portfolio
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', borderRadius: '8px', padding: '0.25rem' }}>
          {(Object.keys(TYPE_CONFIG) as ForecastType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: type === t ? TYPE_CONFIG[t].color : 'transparent',
                color: type === t ? '#fff' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', borderRadius: '8px', padding: '0.25rem' }}>
          {(['3M', '6M', '12M'] as ForecastPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: period === p ? 'var(--primary)' : 'transparent',
                color: period === p ? '#fff' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={generateForecast}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #0B1F3A, #2563EB)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          ) : (
            <RefreshCw size={15} />
          )}
          {loading ? 'Generating...' : 'Generate Forecast'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #EF4444', borderRadius: '10px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!data && !loading && (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Sparkles size={28} color="#2563EB" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Ready to Forecast
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Select a forecast type and period, then click "Generate Forecast" to see AI-powered projections.
          </p>
          <button onClick={generateForecast} className="btn btn-primary">
            Generate My First Forecast
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {data.kpis?.map((kpi: any) => (
              <div key={kpi.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '1.65rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: config.color }}>
                  {kpi.value}
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  {kpi.trend === 'up' && <TrendingUp size={14} color="#10B981" />}
                  {kpi.trend === 'down' && <TrendingDown size={14} color="#EF4444" />}
                  {kpi.trend === 'neutral' && <Minus size={14} color="#6b7280" />}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.25rem' }}>
                  {config.label} Forecast — {data.period}
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{data.summary}</p>
              </div>
              <span style={{ padding: '0.25rem 0.75rem', background: `${config.color}15`, color: config.color, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                {data.period} PROJECTION
              </span>
            </div>
            <ForecastChart dataPoints={data.dataPoints} type={type} />
          </div>

          {/* Insights Panel */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Sparkles size={18} color="#7C3AED" />
              <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                AI-Generated Insights
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.insights?.map((insight: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem', padding: '1rem 1.25rem', background: 'var(--background)', borderRadius: '10px', borderLeft: `3px solid ${config.color}` }}>
                  <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: config.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Forecasts */}
          {data.pastForecasts && data.pastForecasts.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', margin: '0 0 1rem' }}>
                Recent Forecast Runs
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Type', 'Period', 'Generated', 'Summary'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.pastForecasts.map((f: any) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '5px', background: 'var(--background)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {f.forecastType}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{f.period}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(f.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
