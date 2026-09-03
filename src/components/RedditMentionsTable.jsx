import { useMemo } from 'react';
import { StatusBadge, NeedsActionBadge } from './StatusBadge.jsx';

export function RedditMentionsTable({ mentions }) {
  const sorted = useMemo(
    () => [...mentions].sort((a, b) => (b.datePostedIso || '').localeCompare(a.datePostedIso || '')),
    [mentions],
  );

  return (
    <section className="reviews-table-card">
      <h2 className="chart-card__title">Reddit mentions</h2>
      <div className="reviews-table__scroll">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Author</th>
              <th>Post</th>
              <th>Status</th>
              <th>Needs action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((mention) => (
              <tr key={mention.postId || mention.rowNumber}>
                <td className="reviews-table__nowrap">{mention.datePosted || '—'}</td>
                <td>{mention.author || '—'}</td>
                <td className="reviews-table__text">
                  {mention.postUrl ? (
                    <a href={mention.postUrl} target="_blank" rel="noreferrer">
                      {mention.title || mention.postUrl}
                    </a>
                  ) : (
                    mention.title || '—'
                  )}
                  {mention.excerpt && <div className="reviews-table__excerpt">{mention.excerpt}</div>}
                </td>
                <td>
                  <StatusBadge status={mention.status} />
                </td>
                <td>
                  <NeedsActionBadge needsAction={mention.needsAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="reviews-table__empty">No mentions match the current filters</div>}
      </div>
    </section>
  );
}
