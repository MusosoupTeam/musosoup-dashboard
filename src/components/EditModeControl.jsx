import { useEffect, useRef, useState } from 'react';

// The password prompt that unlocks edit mode for this browser tab session.
// The password is only ever checked server-side (see /api/auth/login) -
// this component just collects it and shows the result.
export function EditModeControl({ isEditing, unlock, lock, error, pending }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await unlock(password);
    if (ok) {
      setOpen(false);
      setPassword('');
    }
  }

  if (isEditing) {
    return (
      <div className="edit-mode">
        <span className="edit-mode__badge">Edit mode on</span>
        <button type="button" className="button" onClick={lock}>
          Lock
        </button>
      </div>
    );
  }

  return (
    <div className="edit-mode" ref={rootRef}>
      <button type="button" className="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Unlock edit mode
      </button>

      {open && (
        <form className="edit-mode__popover" onSubmit={handleSubmit}>
          <label className="edit-mode__label">
            Dashboard password
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <div className="edit-mode__error">{error}</div>}
          <div className="edit-mode__popover-actions">
            <button type="button" className="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={pending || !password}>
              {pending ? 'Checking…' : 'Unlock'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
