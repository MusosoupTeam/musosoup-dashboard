import { useState } from 'react';

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 28, left: 32 };
const BAR_MAX_THICKNESS = 24;
const GAP = 2;

function niceMax(value) {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2 || 1;
  return Math.ceil(value / step) * step;
}

// Single-hue "compare magnitude" bar chart - used for the ordinal 1-5 star rating distribution.
export function VerticalBarChart({ data, formatValue = (v) => v.toLocaleString() }) {
  const [hovered, setHovered] = useState(null);
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 0));
  const bandWidth = plotWidth / data.length;
  const barWidth = Math.min(BAR_MAX_THICKNESS, bandWidth - GAP * 2);

  const yTicks = [0, 0.5, 1].map((t) => Math.round(maxValue * t));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Bar chart of star rating distribution" className="chart-svg">
      <g transform={`translate(${PADDING.left},${PADDING.top})`}>
        {yTicks.map((tick) => {
          const y = plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line x1={0} x2={plotWidth} y1={y} y2={y} className="chart-gridline" />
              <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" className="chart-tick">
                {tick.toLocaleString()}
              </text>
            </g>
          );
        })}
        <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className="chart-baseline" />

        {data.map((d, i) => {
          const barHeight = maxValue > 0 ? (d.value / maxValue) * plotHeight : 0;
          const x = i * bandWidth + (bandWidth - barWidth) / 2;
          const y = plotHeight - barHeight;
          const isHovered = hovered === i;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                rx={4}
                className="chart-bar"
                style={{ fill: 'var(--series-1)', opacity: isHovered ? 0.85 : 1 }}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${formatValue(d.value)}`}
              />
              <text x={i * bandWidth + bandWidth / 2} y={plotHeight + 16} textAnchor="middle" className="chart-tick">
                {d.label}
              </text>
              {isHovered && (
                <g transform={`translate(${i * bandWidth + bandWidth / 2},${y - 8})`}>
                  <rect x={-24} y={-20} width={48} height={18} rx={4} className="chart-tooltip-bg" />
                  <text textAnchor="middle" y={-7} className="chart-tooltip-text">
                    {formatValue(d.value)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

const CATEGORICAL_SLOTS = 8;

// Categorical horizontal bar chart - used for the Status breakdown, where the
// category name is the row label so no separate legend swatch is needed.
export function HorizontalBarChart({ data, formatValue = (v) => v.toLocaleString() }) {
  const [hovered, setHovered] = useState(null);
  const rowHeight = 28;
  const plotHeight = data.length * rowHeight;
  const height = plotHeight + PADDING.top + PADDING.bottom - 12;
  const labelWidth = 120;
  const plotWidth = WIDTH - labelWidth - PADDING.right;
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 0));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Bar chart of review status breakdown" className="chart-svg">
      <g transform={`translate(${labelWidth},${PADDING.top})`}>
        <line x1={0} x2={0} y1={0} y2={plotHeight} className="chart-baseline" />
        {data.map((d, i) => {
          const barWidth = maxValue > 0 ? (d.value / maxValue) * plotWidth : 0;
          const y = i * rowHeight + (rowHeight - Math.min(BAR_MAX_THICKNESS, rowHeight - GAP * 2)) / 2;
          const barHeight = Math.min(BAR_MAX_THICKNESS, rowHeight - GAP * 2);
          const isHovered = hovered === i;
          const color =
            d.label === 'Other' ? 'var(--series-other)' : `var(--series-${(i % CATEGORICAL_SLOTS) + 1})`;
          const labelFits = barWidth > 40;

          return (
            <g key={d.label}>
              <text x={-8} y={i * rowHeight + rowHeight / 2} textAnchor="end" dominantBaseline="middle" className="chart-tick">
                {d.label}
              </text>
              <rect
                x={0}
                y={y}
                width={Math.max(barWidth, 1)}
                height={barHeight}
                rx={4}
                style={{ fill: color, opacity: isHovered ? 0.85 : 1 }}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${formatValue(d.value)}`}
              />
              <text
                x={labelFits ? barWidth - 6 : barWidth + 6}
                y={i * rowHeight + rowHeight / 2}
                textAnchor={labelFits ? 'end' : 'start'}
                dominantBaseline="middle"
                className={labelFits ? 'chart-value-on-fill' : 'chart-tick'}
              >
                {formatValue(d.value)}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
