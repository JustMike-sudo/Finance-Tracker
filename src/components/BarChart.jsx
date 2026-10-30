import { useEffect, useState } from 'react';
import { PILLARS } from '../utils/constants';

export default function BarChart({ budgeted, actual }) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxVal = Math.max(
    ...Object.values(budgeted || {}),
    ...Object.values(actual || {}),
    1
  );

  const chartHeight = 200;
  const barWidth = 28;
  const groupGap = 50;
  const barGap = 6;
  const chartWidth = PILLARS.length * (barWidth * 2 + barGap + groupGap);
  const paddingLeft = 30;
  const paddingBottom = 40;

  return (
    <div className="bar-chart-container">
      <div className="bar-chart-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--text-secondary)' }} />
          Budget
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-confirm)' }} />
          Actual
        </span>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth + paddingLeft + 20} ${chartHeight + paddingBottom + 20}`}
        className="bar-chart-svg"
      >
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={chartHeight - ratio * chartHeight + 10}
              x2={chartWidth + paddingLeft}
              y2={chartHeight - ratio * chartHeight + 10}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 5}
              y={chartHeight - ratio * chartHeight + 14}
              fill="var(--text-tertiary)"
              fontSize="9"
              textAnchor="end"
              fontFamily="'JetBrains Mono', monospace"
            >
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {PILLARS.map((pillar, i) => {
          const x = paddingLeft + i * (barWidth * 2 + barGap + groupGap) + groupGap / 2;
          const budgetVal = budgeted?.[pillar.id] || 0;
          const actualVal = actual?.[pillar.id] || 0;
          const budgetHeight = (budgetVal / maxVal) * chartHeight;
          const actualHeight = (actualVal / maxVal) * chartHeight;
          const isOver = actualVal > budgetVal;

          return (
            <g key={pillar.id}>
              {/* Budget bar */}
              <rect
                x={x}
                y={chartHeight - (animate ? budgetHeight : 0) + 10}
                width={barWidth}
                height={animate ? budgetHeight : 0}
                rx="4"
                fill="var(--bg-tertiary)"
                style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              {/* Actual bar */}
              <rect
                x={x + barWidth + barGap}
                y={chartHeight - (animate ? actualHeight : 0) + 10}
                width={barWidth}
                height={animate ? actualHeight : 0}
                rx="4"
                fill={isOver ? 'var(--danger)' : pillar.color}
                opacity={0.85}
                style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.1s' }}
              />
              {/* Label */}
              <text
                x={x + barWidth + barGap / 2}
                y={chartHeight + 28}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="'Noto Sans JP', sans-serif"
                fontWeight="500"
              >
                {pillar.label.substring(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
