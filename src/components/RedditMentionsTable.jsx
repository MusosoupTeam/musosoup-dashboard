import { Fragment, useMemo, useState } from 'react';
import { StatusBadge, NeedsActionBadge } from './StatusBadge.jsx';
import { EditActions } from './EditActions.jsx';
import { formatTimestamp } from '../utils/format.js';

const EDITABLE_FIELDS = ['status', 'notes'];

function draftFrom(mention) {
  return { status: mention.status ?? '', notes: mention.notes ?? '' };
}

export function RedditMentionsTable({ mentions, statusOptions, isEditing, onSaveMention }) {
  const sorted = useMemo(
    () => [...mentions].sort((a, b) => (b.datePostedIso || '').localeCompare(a.datePostedIso || '')),
    [mentions],
  );

  const [editingRow, setEditingRow] = useState(null);
  const [draft, setDraft] = useState(null);

  function startEdit(mention) {
    setEditingRow(mention.rowNumber);
    setDraft(draftFrom(mention));
  }

  function cancelEdit() {
    setEditingRow(null);
    setDraft(null);
  }

  async function handleSave(mention, editedBy) {
    const patch = {};
    for (const field of EDITABLE_FIELDS) {
      if (draft[field] !== (mention[field] ?? '')) patch[field] = draft[field];
    }
    if (Object.keys(patch).length > 0) {
      await onSaveMention(mention, patch, editedBy);
    }
    setEditingRow(null);
    setDraft(null);
  }

  const dropdownOptions = useMemo(() => {
    const options = new Set(statusOptions);
    if (draft?.status) options.add(draft.status);
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [statusOptions, draft]);

  const columnCount = isEditing ? 7 : 6;

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
              <th>Last updated</th>
              {isEditing && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((mention) => (
              <Fragment key={mention.rowNumber}>
                <tr>
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
                  <td className="reviews-table__muted-text">
                    {mention.lastUpdatedAt
                      ? `${mention.editedBy || 'Unknown'}, ${formatTimestamp(mention.lastUpdatedAt)}`
                      : '—'}
                  </td>
                  {isEditing && (
                    <td>
                      {editingRow === mention.rowNumber ? (
                        <button type="button" className="button" onClick={cancelEdit}>
                          Close
                        </button>
                      ) : (
                        <button type="button" className="button" onClick={() => startEdit(mention)}>
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>

                {isEditing && editingRow === mention.rowNumber && (
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

                          <label className="edit-row__field edit-row__field--wide">
                            Notes
                            <textarea
                              rows={2}
                              value={draft.notes}
                              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                            />
                          </label>
                        </div>

                        {mention.lastUpdatedAt && (
                          <div className="edit-row__last-updated">
                            Last updated: {mention.editedBy || 'Unknown'}, {formatTimestamp(mention.lastUpdatedAt)}
                          </div>
                        )}

                        <EditActions onSave={(editedBy) => handleSave(mention, editedBy)} onCancel={cancelEdit} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="reviews-table__empty">No mentions match the current filters</div>}
      </div>
    </section>
  );
}
