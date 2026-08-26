import { useMemo } from 'react';
import { StatusBadge, NeedsActionBadge } from './StatusBadge.jsx';

function Stars({ rating }) {
  if (rating == null) return <span className="reviews-table__muted">—</span>;
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="reviews-table__muted">{'★'.repeat(Math.max(0, 5 - rating))}</span>
    </span>
  );
}

export function ReviewsTable({ reviews }) {
  const sorted = useMemo(
    () => [...reviews].sort((a, b) => (b.datePostedIso || '').localeCompare(a.datePostedIso || '')),
    [reviews],
  );

  return (
    <section className="reviews-table-card">
      <h2 className="chart-card__title">Reviews</h2>
      <div className="reviews-table__scroll">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Needs action</th>
              <th>Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((review) => (
              <tr key={review.reviewId || review.rowNumber}>
                <td className="reviews-table__nowrap">{review.datePosted || '—'}</td>
                <td>{review.reviewerName || '—'}</td>
                <td className="reviews-table__nowrap">
                  <Stars rating={review.starRating} />
                </td>
                <td className="reviews-table__text">
                  {review.reviewUrl ? (
                    <a href={review.reviewUrl} target="_blank" rel="noreferrer">
                      {review.reviewText || review.reviewUrl}
                    </a>
                  ) : (
                    review.reviewText || '—'
                  )}
                </td>
                <td>
                  <StatusBadge status={review.status} />
                </td>
                <td>
                  <NeedsActionBadge needsAction={review.needsAction} />
                </td>
                <td>{review.assignedTo || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="reviews-table__empty">No reviews match the current filters</div>}
      </div>
    </section>
  );
}
