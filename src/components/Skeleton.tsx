import React from 'react';

// ─── Shimmer Keyframe Injection ───────────────────────────────────────────────
// We inject the keyframes once as a shared <style> tag rendered by SkeletonProvider
// or just inline it wherever a Skeleton is used. Since Next.js server components
// don't always have a clean place for global keyframes, we use a single StyleTag
// component that each skeleton family imports.

function ShimmerStyle() {
  return (
    <style>{`
      @keyframes proventa-shimmer {
        0%   { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
      .proventa-shimmer {
        background: linear-gradient(
          90deg,
          #e2e8f0 0px,
          #f0f4f8 40px,
          #e2e8f0 80px
        );
        background-size: 600px 100%;
        animation: proventa-shimmer 1.6s ease-in-out infinite;
      }
    `}</style>
  );
}

// ─── Base shimmer div ──────────────────────────────────────────────────────────

interface ShimmerBoxProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

function ShimmerBox({ width = '100%', height = '1rem', borderRadius = '6px', style }: ShimmerBoxProps) {
  return (
    <>
      <ShimmerStyle />
      <div
        className="proventa-shimmer"
        style={{
          width,
          height,
          borderRadius,
          flexShrink: 0,
          ...style,
        }}
      />
    </>
  );
}

// ─── SkeletonText ─────────────────────────────────────────────────────────────

export interface SkeletonTextProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function SkeletonText({ width = '100%', height = '0.875rem', style }: SkeletonTextProps) {
  return (
    <ShimmerBox
      width={width}
      height={height}
      borderRadius="4px"
      style={style}
    />
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

export interface SkeletonCardProps {
  /** Height of the card block */
  height?: string | number;
  /** Show a header line + body lines (default: true) */
  showContent?: boolean;
  style?: React.CSSProperties;
}

export function SkeletonCard({ height = '160px', showContent = true, style }: SkeletonCardProps) {
  return (
    <>
      <ShimmerStyle />
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          minHeight: height,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          ...style,
        }}
      >
        {showContent ? (
          <>
            {/* Top row: small label + stat */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ShimmerBox width="40%" height="0.8rem" borderRadius="4px" />
              <ShimmerBox width="28px" height="28px" borderRadius="8px" />
            </div>
            {/* Main value */}
            <ShimmerBox width="55%" height="2rem" borderRadius="6px" />
            {/* Sub line */}
            <ShimmerBox width="70%" height="0.75rem" borderRadius="4px" />
            {/* Progress bar */}
            <ShimmerBox width="100%" height="6px" borderRadius="99px" />
          </>
        ) : (
          <ShimmerBox width="100%" height={height} borderRadius="12px" />
        )}
      </div>
    </>
  );
}

// ─── SkeletonRow ──────────────────────────────────────────────────────────────

export interface SkeletonRowProps {
  /** Number of columns in the row */
  columns?: number;
  /** Heights of each column cell (applies to all if single value) */
  cellHeight?: string;
}

export function SkeletonRow({ columns = 4, cellHeight = '0.875rem' }: SkeletonRowProps) {
  const widths = ['25%', '30%', '20%', '15%', '10%'];
  return (
    <>
      <ShimmerStyle />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '1.125rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerBox
            key={i}
            width={widths[i % widths.length]}
            height={cellHeight}
            borderRadius="4px"
          />
        ))}
      </div>
    </>
  );
}

// ─── SkeletonTable ────────────────────────────────────────────────────────────

export interface SkeletonTableProps {
  /** Number of data rows to render */
  rows?: number;
  /** Number of columns per row */
  columns?: number;
  /** Whether to show a header row */
  showHeader?: boolean;
}

export function SkeletonTable({ rows = 5, columns = 4, showHeader = true }: SkeletonTableProps) {
  return (
    <>
      <ShimmerStyle />
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Header */}
        {showHeader && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <ShimmerBox key={i} width="60%" height="0.75rem" borderRadius="4px" />
            ))}
          </div>
        )}

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1rem',
              padding: '1.125rem 1.25rem',
              borderBottom: rowIdx < rows - 1 ? '1px solid #e2e8f0' : 'none',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => {
              // Vary widths for a realistic feel
              const widthMap = [
                ['80%', '60%', '55%', '70%'],
                ['65%', '75%', '40%', '50%'],
                ['70%', '50%', '65%', '55%'],
                ['90%', '40%', '70%', '45%'],
                ['60%', '80%', '50%', '65%'],
              ];
              const w = widthMap[rowIdx % widthMap.length]?.[colIdx % 4] ?? '60%';
              return (
                <ShimmerBox key={colIdx} width={w} height="0.875rem" borderRadius="4px" />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
