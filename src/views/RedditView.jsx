import { useMemo, useState } from 'react';
import { defaultRedditFilters, filterRedditMentions } from '../utils/filterRedditMentions.js';
import { resolveDateRange } from '../utils/dateRanges.js';
import { computeRedditStats, uniqueRedditStatuses } from '../utils/redditStats.js';
import { updateRedditMention } from '../api/redditApi.js';
import { RedditFiltersBar } from '../components/RedditFiltersBar.jsx';
import { RedditKpiRow } from '../components/RedditKpiRow.jsx';
import { ChartCard } from '../components/ChartCard.jsx';
import { HorizontalBarChart } from '../components/BarChart.jsx';
import { TrendChart } from '../components/TrendChart.jsx';
import { RedditMentionsTable } from '../components/RedditMentionsTable.jsx';

export function RedditView({ mentions, status, error, refresh, applyMentionUpdate, isEditing, editToken }) {
  const [filters, setFilters] = useState(defaultRedditFilters);

  const statusOptions = useMemo(() => uniqueRedditStatuses(mentions), [mentions]);

  const filtered = useMemo(() => {
    const { start, end } = resolveDateRange(filters.preset, { start: filters.customStart, end: filters.customEnd });
    return filterRedditMentions(mentions, { ...filters, start, end });
  }, [mentions, filters]);

  const stats = useMemo(() => computeRedditStats(filtered), [filtered]);

  async function handleSaveMention(mention, patch, editedBy) {
    const updated = await updateRedditMention({
      rowNumber: mention.rowNumber,
      postId: mention.postId,
      patch,
      editedBy,
      token: editToken,
    });
    applyMentionUpdate(mention.rowNumber, updated);
  }

  return (
    <>
      <RedditFiltersBar
        filters={filters}
        onChange={setFilters}
        statusOptions={statusOptions}
        resultCount={filtered.length}
        totalCount={mentions.length}
      />

      {status === 'error' && (
        <div className="error-banner">
          <span>Couldn't load Reddit mentions: {error}</span>
          <button type="button" className="button" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {status === 'loading' ? (
        <div className="loading-state">Loading Reddit mentions…</div>
      ) : (
        <>
          <RedditKpiRow stats={stats} />

          <div className="charts-grid">
            <ChartCard
              title="Mentions over time"
              subtitle={stats.trend.bucket === 'month' ? 'By month' : 'By day'}
              empty={stats.trend.points.length === 0}
            >
              <TrendChart
                points={stats.trend.points}
                bucket={stats.trend.bucket}
                ariaLabel="Line chart of Reddit mentions over time"
                unitLabel="mentions"
              />
            </ChartCard>

            <ChartCard title="Status breakdown" empty={stats.statusBreakdown.length === 0}>
              <HorizontalBarChart data={stats.statusBreakdown} ariaLabel="Bar chart of Reddit mention status breakdown" />
            </ChartCard>
          </div>

          <RedditMentionsTable
            mentions={filtered}
            statusOptions={statusOptions}
            isEditing={isEditing}
            onSaveMention={handleSaveMention}
          />
        </>
      )}
    </>
  );
}
