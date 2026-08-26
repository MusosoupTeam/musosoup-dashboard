export function ChartCard({ title, subtitle, children, empty }) {
  return (
    <section className="chart-card">
      <header className="chart-card__header">
        <h2 className="chart-card__title">{title}</h2>
        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
      </header>
      {empty ? <div className="chart-card__empty">No data in the selected range</div> : children}
    </section>
  );
}
