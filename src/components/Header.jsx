function formatFetchedAt(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function Header({ status, fetchedAt, onRefresh }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-header__title">Musosoup Feedback Dashboard</h1>
        <p className="app-header__subtitle">Read-only view of the Reviews sheet · no sign-in, no write-back</p>
      </div>
      <div className="app-header__actions">
        {fetchedAt && <span className="app-header__fetched-at">Updated {formatFetchedAt(fetchedAt)}</span>}
        <button type="button" className="button" onClick={onRefresh} disabled={status === 'loading' || status === 'refreshing'}>
          {status === 'refreshing' ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}
