export function StatTile({ label, value, sublabel, accent }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__label">{label}</div>
      <div className="stat-tile__value">{value}</div>
      {sublabel && (
        <div className="stat-tile__sublabel">
          {accent && <span className={`stat-tile__dot stat-tile__dot--${accent}`} aria-hidden="true" />}
          {sublabel}
        </div>
      )}
    </div>
  );
}
