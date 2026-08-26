import { formatCompactNumber, formatPercent, formatRating } from '../utils/format.js';

function StatTile({ label, value, sublabel, accent }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__label">{label}</div>
      <div className="stat-tile__value">{value}</div>
      {sublabel && (
        <div className="stat-tile__sublabel">
          {accent && <span className={`stat-tile__dot stat-tile__dot--${accent}`} aria-hidden="true" />}
          {sublabel}
        </div>
      )}
    </div>
  );
}

export function KpiRow({ stats }) {
  return (
    <div className="kpi-row">
      <StatTile label="Reviews in range" value={formatCompactNumber(stats.total)} />
      <StatTile
        label="Average rating"
        value={stats.avgRating == null ? '—' : `${formatRating(stats.avgRating)}★`}
        sublabel={`from ${formatCompactNumber(stats.ratedCount)} rated`}
      />
      <StatTile
        label="Needs action"
        value={formatCompactNumber(stats.needsActionCount)}
        sublabel={`${formatPercent(stats.needsActionCount, stats.total)} of range`}
        accent={stats.needsActionCount > 0 ? 'critical' : 'good'}
      />
      <StatTile
        label="Contacted"
        value={formatCompactNumber(stats.contactedCount)}
        sublabel={`${formatPercent(stats.contactedCount, stats.total)} of range`}
      />
    </div>
  );
}
