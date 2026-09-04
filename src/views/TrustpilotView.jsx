import { useMemo, useState } from 'react';
import { defaultFilters, filterReviews } from '../utils/filterReviews.js';
import { resolveDateRange } from '../utils/dateRanges.js';
import { computeStats, uniqueStatuses } from '../utils/stats.js';
import { updateReview } from '../api/reviewsApi.js';
import { FiltersBar } from '../components/FiltersBar.jsx';
import { KpiRow } from '../components/KpiRow.jsx';
import { ChartCard } from '../components/ChartCard.jsx';
import { VerticalBarChart, HorizontalBarChart } from '../components/BarChart.jsx';
import { TrendChart } from '../components/TrendChart.jsx';
import { ReviewsTable } from '../components/ReviewsTable.jsx';

export function TrustpilotView({ reviews, status, error, refresh, applyReviewUpdate, isEditing, editToken }) {
  const [filters, setFilters] = useState(defaultFilters);

  const statusOptions = useMemo(() => uniqueStatuses(reviews), [reviews]);

  const filtered = useMemo(() => {
    const { start, end } = resolveDateRange(filters.preset, { start: filters.customStart, end: filters.customEnd });
    return filterReviews(reviews, { ...filters, start, end });
  }, [reviews, filters]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  async function handleSaveReview(review, patch, editedBy) {
    const updated = await updateReview({
      rowNumber: review.rowNumber,
      reviewId: review.reviewId,
      patch,
      editedBy,
      token: editToken,
    });
    applyReviewUpdate(review.rowNumber, updated);
  }

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        statusOptions={statusOptions}
        resultCount={filtered.length}
        totalCount={reviews.length}
      />

      {status === 'error' && (
        <div className="error-banner">
          <span>Couldn't load reviews: {error}</span>
          <button type="button" className="button" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {status === 'loading' ? (
        <div className="loading-state">Loading reviews…</div>
      ) : (
        <>
          <KpiRow stats={stats} />

          <div className="charts-grid">
            <ChartCard
              title="Reviews over time"
              subtitle={stats.trend.bucket === 'month' ? 'By month' : 'By day'}
              empty={stats.trend.points.length === 0}
            >
              <TrendChart points={stats.trend.points} bucket={stats.trend.bucket} />
            </ChartCard>

            <ChartCard title="Rating distribution" empty={filtered.length === 0}>
              <VerticalBarChart data={stats.ratingDistribution} />
            </ChartCard>

            <ChartCard title="Status breakdown" empty={stats.statusBreakdown.length === 0}>
              <HorizontalBarChart data={stats.statusBreakdown} ariaLabel="Bar chart of review status breakdown" />
            </ChartCard>
          </div>

          <ReviewsTable
            reviews={filtered}
            statusOptions={statusOptions}
            isEditing={isEditing}
            onSaveReview={handleSaveReview}
          />
        </>
      )}
    </>
  );
}
