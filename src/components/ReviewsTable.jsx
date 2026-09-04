import { Fragment, useMemo, useState } from 'react';
import { StatusBadge, NeedsActionBadge } from './StatusBadge.jsx';
import { EditActions } from './EditActions.jsx';
import { formatTimestamp } from '../utils/format.js';

const EDITABLE_FIELDS = ['status', 'notes', 'assignedTo', 'outcome', 'suggestedReply'];

function Stars({ rating }) {
  if (rating == null) return <span className="reviews-table__muted">—</span>;
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="reviews-table__muted">{'★'.repeat(Math.max(0, 5 - rating))}</span>
    </span>
  );
}

function draftFrom(review) {
  return {
    status: review.status ?? '',
    notes: review.notes ?? '',
    assignedTo: review.assignedTo ?? '',
    outcome: review.outcome ?? '',
    suggestedReply: review.suggestedReply ?? '',
  };
}

export function ReviewsTable({ reviews, statusOptions, isEditing, onSaveReview }) {
  const sorted = useMemo(
    () => [...reviews].sort((a, b) => (b.datePostedIso || '').localeCompare(a.datePostedIso || '')),
    [reviews],
  );

  const [editingRow, setEditingRow] = useState(null);
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  function startEdit(review) {
    setEditingRow(review.rowNumber);
    setDraft(draftFrom(review));
    setCopied(false);
  }

  function cancelEdit() {
    setEditingRow(null);
    setDraft(null);
  }

  async function copyReply() {
    try {
      await navigator.clipboard.writeText(draft?.suggestedReply ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable (e.g. no HTTPS, denied permission) - the
      // text is still right there in the textarea to select and copy by hand
    }
  }

  async function handleSave(review, editedBy) {
    const patch = {};
    for (const field of EDITABLE_FIELDS) {
      if (draft[field] !== (review[field] ?? '')) patch[field] = draft[field];
    }
    if (Object.keys(patch).length > 0) {
      await onSaveReview(review, patch, editedBy);
    }
    setEditingRow(null);
    setDraft(null);
  }

  const dropdownOptions = useMemo(() => {
    const options = new Set([...statusOptions, 'Contacted']);
    if (draft?.status) options.add(draft.status);
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [statusOptions, draft]);

  const columnCount = isEditing ? 9 : 8;

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
              <th>Last updated</th>
              {isEditing && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((review) => (
              <Fragment key={review.rowNumber}>
                <tr>
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
                  <td className="reviews-table__muted-text">
                    {review.lastUpdatedAt
                      ? `${review.editedBy || 'Unknown'}, ${formatTimestamp(review.lastUpdatedAt)}`
                      : '—'}
                  </td>
                  {isEditing && (
                    <td>
                      {editingRow === review.rowNumber ? (
                        <button type="button" className="button" onClick={cancelEdit}>
                          Close
                        </button>
                      ) : (
                        <button type="button" className="button" onClick={() => startEdit(review)}>
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>

                {isEditing && editingRow === review.rowNumber && (
                  <tr className="edit-row">
                    <td colSpan={columnCount}>
                      <div className="edit-row__panel">
                        <div className="edit-row__grid">
                          <label className="edit-row__field">
                            Status
                            <select
                              value={draft.status}
                              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                            >
                              {dropdownOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="edit-row__field">
                            Assigned to
                            <input
                              type="text"
                              value={draft.assignedTo}
                              onChange={(event) => setDraft({ ...draft, assignedTo: event.target.value })}
                            />
                          </label>

                          <label className="edit-row__field">
                            Outcome
                            <input
                              type="text"
                              value={draft.outcome}
                              onChange={(event) => setDraft({ ...draft, outcome: event.target.value })}
                            />
                          </label>

                          <label className="edit-row__field edit-row__field--wide">
                            Notes
                            <textarea
                              rows={2}
                              value={draft.notes}
                              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                            />
                          </label>

                          <label className="edit-row__field edit-row__field--wide">
                            Suggested reply
                            <textarea
                              rows={3}
                              value={draft.suggestedReply}
                              onChange={(event) => setDraft({ ...draft, suggestedReply: event.target.value })}
                            />
                            <div className="edit-row__reply-actions">
                              <button type="button" className="button" onClick={copyReply}>
                                {copied ? 'Copied!' : 'Copy to clipboard'}
                              </button>
                              <span className="edit-row__reply-hint">Tweak the draft, then paste it into Trustpilot manually</span>
                            </div>
                          </label>
                        </div>

                        {review.lastUpdatedAt && (
                          <div className="edit-row__last-updated">
                            Last updated: {review.editedBy || 'Unknown'}, {formatTimestamp(review.lastUpdatedAt)}
                          </div>
                        )}

                        <EditActions onSave={(editedBy) => handleSave(review, editedBy)} onCancel={cancelEdit} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="reviews-table__empty">No reviews match the current filters</div>}
      </div>
    </section>
  );
}
