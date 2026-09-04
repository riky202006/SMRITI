import { useState } from 'react';

export default function MemoryActivityChart({ reports = [] }) {
  const [activeReportIndex, setActiveReportIndex] = useState(reports.length - 1);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'

  // Reverse so older sessions are on left, newest on right
  const data = [...reports].reverse();

  if (data.length === 0) {
    return (
      <div style={{
        padding: 24,
        textAlign: 'center',
        backgroundColor: 'var(--surface-container-low)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--outline)',
      }}>
        <p>No memory game sessions recorded yet.</p>
      </div>
    );
  }

  // Calculate summary metrics
  const totalSessions = data.length;
  const avgAccuracy = Math.round(data.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalSessions);
  const latestAccuracy = data[data.length - 1]?.accuracy || 0;
  const prevAccuracy = data.length > 1 ? data[data.length - 2]?.accuracy || 0 : latestAccuracy;

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

  // Fluid responsive SVG coordinates (viewBox system)
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.accuracy || 0) / 100) * chartHeight;
    return { x, y, accuracy: d.accuracy, date: d.date, raw: d, index };
  });

  // Generate SVG path string for line
  const linePath = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Generate Area Fill path string
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      border: '1px solid var(--surface-container-high)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Cognitive Memory Performance
          </span>
          <h3 className="headline-md" style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: '24px' }}>
            {avgAccuracy}% <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--outline)' }}>Avg Accuracy</span>
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: `${trendColor}18`,
            color: trendColor,
          }}>
            {trendLabel}
          </span>
          <div style={{ display: 'flex', gap: 4, backgroundColor: 'var(--surface-container)', padding: 3, borderRadius: 'var(--radius-sm)' }}>
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

      {/* SVG Responsive Container */}
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', maxHeight: '240px', overflow: 'visible' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX - 6}
                  y1={y}
                  x2={svgWidth - paddingX + 6}
                  y2={y}
                  stroke="#eee"
                  strokeDasharray={val === 0 || val === 100 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#888" fontWeight="600">
                  {val}%
                </text>
              </g>
            );
          })}

          {chartType === 'line' ? (
            <>
              {/* Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {/* Curve Line */}
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
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 7 : 5}
                      fill={isActive ? 'var(--primary)' : 'var(--white)'}
                      stroke="var(--primary)"
                      strokeWidth={isActive ? 3 : 2}
                    />
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="11"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}
                    {/* Date label under X-axis */}
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isActive ? '800' : '500'}
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
                const barWidth = 28;
                const barX = pt.x - barWidth / 2;
                const barY = pt.y;
                const barH = paddingTop + chartHeight - pt.y;

                return (
                  <g key={i} onClick={() => setActiveReportIndex(i)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={Math.max(4, barH)}
                      rx="4"
                      fill={isActive ? 'var(--primary)' : 'var(--mint)'}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="var(--primary)"
                    >
                      {pt.accuracy}%
                    </text>
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isActive ? '800' : '500'}
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
        <div style={{
          marginTop: 16,
          padding: '14px 16px',
          backgroundColor: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--primary)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
              Session: {activeReport.date} ({activeReport.timestamp || 'Recorded'})
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#2e7d32' }}>
              +{activeReport.score} Pts
            </span>
          </div>

          <p style={{ margin: '4px 0 10px', fontSize: 13, color: 'var(--ink)' }}>
            {activeReport.summary}
          </p>

          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span style={{ backgroundColor: 'var(--white)', padding: '4px 10px', borderRadius: 4, border: '1px solid #eee' }}>
              Accuracy: <strong>{activeReport.accuracy}%</strong>
            </span>
            <span style={{ backgroundColor: 'var(--white)', padding: '4px 10px', borderRadius: 4, border: '1px solid #eee' }}>
              Rounds: <strong>{activeReport.correctCount}/{activeReport.totalRounds || 5} Correct</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
