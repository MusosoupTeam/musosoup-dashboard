import { StatTile } from './StatTile.jsx';
import { formatCompactNumber, formatPercent, formatRating } from '../utils/format.js';

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
