import { useState } from 'react';
import { getLastEditorName, setLastEditorName } from '../utils/editedByMemory.js';

// Shared Save/Cancel + "Edited by" control for an inline row edit form. The
// name field is retyped every save (informal attribution, not a login) but
// prefilled from what was last used in this browser tab session.
export function EditActions({ onSave, onCancel }) {
  const [editedBy, setEditedBy] = useState(() => getLastEditorName());
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = editedBy.trim();
    if (!trimmed) {
      setError('Enter your name or initials to save.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(trimmed);
      setLastEditorName(trimmed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="edit-row__actions">
      <label className="edit-row__by">
        Edited by
        <input
          type="text"
          value={editedBy}
          onChange={(event) => setEditedBy(event.target.value)}
          placeholder="Your name or initials"
        />
      </label>
      {error && <div className="edit-row__error">{error}</div>}
      <div className="edit-row__buttons">
        <button type="button" className="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="button button--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
