import { useRef, useState } from 'react';
import { formatBucketLabel } from '../utils/format.js';

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

function niceMax(value) {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2 || 1;
  return Math.ceil(value / step) * step;
}

export function TrendChart({ points, bucket, ariaLabel = 'Line chart of reviews over time', unitLabel = 'reviews' }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = niceMax(Math.max(...points.map((p) => p.value), 0));

  const xFor = (i) => (points.length > 1 ? (i / (points.length - 1)) * plotWidth : plotWidth / 2);
  const yFor = (v) => plotHeight - (maxValue > 0 ? (v / maxValue) * plotHeight : 0);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.value)}`).join(' ');
  const areaPath = points.length
    ? `${linePath} L${xFor(points.length - 1)},${plotHeight} L${xFor(0)},${plotHeight} Z`
    : '';

  const yTicks = [0, 0.5, 1].map((t) => Math.round(maxValue * t));
  const tickEvery = Math.max(1, Math.ceil(points.length / 6));

  function handlePointerMove(event) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH - PADDING.left;
    const ratio = Math.min(1, Math.max(0, relativeX / plotWidth));
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(index);
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="trend-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        className="chart-svg"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {yTicks.map((tick) => {
            const y = yFor(tick);
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

          {points.map(
            (p, i) =>
              i % tickEvery === 0 && (
                <text key={p.date} x={xFor(i)} y={plotHeight + 16} textAnchor="middle" className="chart-tick">
                  {formatBucketLabel(p.date, bucket)}
                </text>
              ),
          )}

          {areaPath && <path d={areaPath} style={{ fill: 'var(--series-1)', opacity: 0.1 }} />}
          {linePath && <path d={linePath} style={{ stroke: 'var(--series-1)' }} className="chart-line" />}

          {hovered && (
            <g>
              <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={0} y2={plotHeight} className="chart-crosshair" />
              <circle cx={xFor(hoverIndex)} cy={yFor(hovered.value)} r={4} className="chart-marker" style={{ fill: 'var(--series-1)' }} />
            </g>
          )}
        </g>
      </svg>

      {hovered && (
        <div
          className="trend-chart__tooltip"
          style={{
            left: `${((PADDING.left + xFor(hoverIndex)) / WIDTH) * 100}%`,
          }}
        >
          <div className="trend-chart__tooltip-value">{hovered.value.toLocaleString()} {unitLabel}</div>
          <div className="trend-chart__tooltip-date">{formatBucketLabel(hovered.date, bucket)}</div>
        </div>
      )}
    </div>
  );
}
