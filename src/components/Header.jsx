import { EditModeControl } from './EditModeControl.jsx';

function formatFetchedAt(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function Header({ status, fetchedAt, onRefresh, editSession }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-header__title">Musosoup Feedback Dashboard</h1>
        <p className="app-header__subtitle">Open to browse · unlock edit mode with the dashboard password to make changes</p>
      </div>
      <div className="app-header__actions">
        {fetchedAt && <span className="app-header__fetched-at">Updated {formatFetchedAt(fetchedAt)}</span>}
        <button type="button" className="button" onClick={onRefresh} disabled={status === 'loading' || status === 'refreshing'}>
          {status === 'refreshing' ? 'Refreshing…' : 'Refresh'}
        </button>
        <EditModeControl {...editSession} />
      </div>
    </header>
  );
}
