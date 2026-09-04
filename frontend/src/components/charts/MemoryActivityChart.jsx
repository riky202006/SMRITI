import { useState, useRef, useEffect } from 'react';

export default function MemoryActivityChart({ reports = [] }) {
  const [activeReportIndex, setActiveReportIndex] = useState(reports.length - 1);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const scrollContainerRef = useRef(null);

  // Reverse so older sessions are on left, newest on right
  const data = [...reports].reverse();

  // Scroll to the latest sessions on initial render and data change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data.length, chartType]);

  // Keep active report index valid
  useEffect(() => {
    if (data.length > 0) {
      setActiveReportIndex(data.length - 1);
    }
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          backgroundColor: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--outline)',
        }}
      >
        <p>No memory game sessions recorded yet.</p>
      </div>
    );
  }

  // Calculate summary metrics (strictly clamped 0 - 100%)
  const totalSessions = data.length;
  const avgAccuracy = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        data.reduce((acc, r) => acc + Math.min(100, Math.max(0, Number(r.accuracy) || 0)), 0) / totalSessions
      )
    )
  );
  const latestAccuracy = Math.min(100, Math.max(0, Number(data[data.length - 1]?.accuracy) || 0));
  const prevAccuracy =
    data.length > 1
      ? Math.min(100, Math.max(0, Number(data[data.length - 2]?.accuracy) || 0))
      : latestAccuracy;

  let trendLabel = '💪 Stable';
  let trendColor = '#2e7d32';
  if (latestAccuracy > prevAccuracy) {
    trendLabel = '📈 Improving';
    trendColor = 'var(--primary)';
  } else if (latestAccuracy < prevAccuracy) {
    trendLabel = '⚠️ Minor Dip';
    trendColor = '#e67e22';
  }

  const activeReport = data[activeReportIndex] || data[data.length - 1];

  // Generous spacing per data point to prevent clutter and overlapping
  const pointSpacing = 56; // Pixels per data point
  const paddingLeft = 48;
  const paddingRight = 36;
  const paddingTop = 32;
  const paddingBottom = 42;
  const svgHeight = 220;
  const chartHeight = svgHeight - paddingTop - paddingBottom; // 146px

  const minChartWidth = 480;
  const computedChartWidth = Math.max(minChartWidth, (data.length - 1) * pointSpacing);
  const svgWidth = computedChartWidth + paddingLeft + paddingRight;

  // Calculate coordinates for each point with strict 0 - 100% clamping
  const points = data.map((d, index) => {
    const safeAccuracy = Math.min(100, Math.max(0, Math.round(Number(d.accuracy) || 0)));
    const x =
      data.length > 1
        ? paddingLeft + (index / (data.length - 1)) * computedChartWidth
        : paddingLeft + computedChartWidth / 2;
    const y = paddingTop + chartHeight - (safeAccuracy / 100) * chartHeight;
    return { x, y, accuracy: safeAccuracy, date: d.date, raw: d, index };
  });

  // Generate SVG path string for line
  const linePath = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Generate Area Fill path string
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

  const isScrollable = svgWidth > 580;

  return (
    <div
      style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        border: '1px solid var(--surface-container-high)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Metrics */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--outline)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Cognitive Memory Performance
          </span>
          <h3
            className="headline-md"
            style={{
              margin: '4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '24px',
            }}
          >
            {avgAccuracy}%{' '}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--outline)' }}>
              Avg Accuracy
            </span>
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {isScrollable && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--outline)',
                backgroundColor: 'var(--surface-container-low)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 600,
              }}
            >
              ↔️ Scrollable ({totalSessions} sessions)
            </span>
          )}

          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: `${trendColor}18`,
              color: trendColor,
            }}
          >
            {trendLabel}
          </span>

          <div
            style={{
              display: 'flex',
              gap: 4,
              backgroundColor: 'var(--surface-container)',
              padding: 3,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <button
              type="button"
              onClick={() => setChartType('line')}
              style={{
                border: 'none',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 4,
                backgroundColor: chartType === 'line' ? 'var(--primary)' : 'transparent',
                color: chartType === 'line' ? 'white' : 'var(--outline)',
                cursor: 'pointer',
              }}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              style={{
                border: 'none',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 4,
                backgroundColor: chartType === 'bar' ? 'var(--primary)' : 'transparent',
                color: chartType === 'bar' ? 'white' : 'var(--outline)',
                cursor: 'pointer',
              }}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Graph Viewport (Only the graph scrolls) */}
      <div
        ref={scrollContainerRef}
        className="chart-scroll-viewport"
        style={{
          width: '100%',
          maxWidth: '100%',
          paddingBottom: 6,
        }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{
            display: 'block',
            minWidth: `${svgWidth}px`,
            overflow: 'visible',
            userSelect: 'none',
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Left Y-Axis labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft - 8}
                  y1={y}
                  x2={svgWidth - 12}
                  y2={y}
                  stroke="#f0f0f0"
                  strokeDasharray={val === 0 || val === 100 ? 'none' : '4 4'}
                  strokeWidth="1.2"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#8e8e8e"
                  fontWeight="600"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {chartType === 'line' ? (
            <>
              {/* Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {/* Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((pt, i) => {
                const isActive = activeReportIndex === i;
                return (
                  <g
                    key={i}
                    onClick={() => setActiveReportIndex(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover hit box */}
                    <rect
                      x={pt.x - 22}
                      y={paddingTop}
                      width={44}
                      height={chartHeight + 35}
                      fill="transparent"
                    />

                    {/* Active Halo */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 6.5 : 4.5}
                      fill={isActive ? 'var(--primary)' : 'var(--white)'}
                      stroke="var(--primary)"
                      strokeWidth={isActive ? 3 : 2}
                    />

                    {/* Value Badge on Node */}
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={isActive ? 'var(--primary)' : '#555'}
                    >
                      {pt.accuracy}%
                    </text>

                    {/* Date label under X-axis */}
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isActive ? '800' : '600'}
                      fill={isActive ? 'var(--primary)' : '#666'}
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            /* Bar Chart View */
            <g>
              {points.map((pt, i) => {
                const isActive = activeReportIndex === i;
                const barWidth = 22;
                const barX = pt.x - barWidth / 2;
                const barY = pt.y;
                const barH = paddingTop + chartHeight - pt.y;

                return (
                  <g
                    key={i}
                    onClick={() => setActiveReportIndex(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover hit box */}
                    <rect
                      x={pt.x - 24}
                      y={paddingTop}
                      width={48}
                      height={chartHeight + 35}
                      fill="transparent"
                    />

                    {/* Bar Rectangle */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={Math.max(4, barH)}
                      rx="4"
                      fill={isActive ? 'var(--primary)' : 'var(--mint, #86efac)'}
                      stroke={isActive ? 'var(--primary)' : 'none'}
                      strokeWidth={isActive ? '1.5' : '0'}
                    />

                    {/* Accuracy Percentage above Bar */}
                    <text
                      x={pt.x}
                      y={Math.max(16, pt.y - 6)}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={isActive ? 'var(--primary)' : '#1b5e20'}
                    >
                      {pt.accuracy}%
                    </text>

                    {/* Date label under X-axis */}
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isActive ? '800' : '600'}
                      fill={isActive ? 'var(--primary)' : '#666'}
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Selected Session Detail Card */}
      {activeReport && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 16px',
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
              Session: {activeReport.date} ({activeReport.timestamp || 'Recorded'})
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#2e7d32' }}>
              +{activeReport.score} Pts
            </span>
          </div>

          <p style={{ margin: '3px 0 8px', fontSize: 13, color: 'var(--ink)' }}>
            {activeReport.summary}
          </p>

          <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
            <span
              style={{
                backgroundColor: 'var(--white)',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid #eee',
              }}
            >
              Accuracy: <strong>{Math.min(100, Math.max(0, Math.round(Number(activeReport.accuracy) || 0)))}%</strong>
            </span>
            <span
              style={{
                backgroundColor: 'var(--white)',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid #eee',
              }}
            >
              Rounds: <strong>{activeReport.correctCount}/{activeReport.totalRounds || 5} Correct</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
