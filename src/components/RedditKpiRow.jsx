import { StatTile } from './StatTile.jsx';
import { formatCompactNumber, formatPercent } from '../utils/format.js';

export function RedditKpiRow({ stats }) {
  return (
    <div className="kpi-row">
      <StatTile label="Mentions in range" value={formatCompactNumber(stats.total)} />
      <StatTile
        label="Needs action"
        value={formatCompactNumber(stats.needsActionCount)}
        sublabel={`${formatPercent(stats.needsActionCount, stats.total)} of range`}
        accent={stats.needsActionCount > 0 ? 'critical' : 'good'}
      />
    </div>
  );
}
