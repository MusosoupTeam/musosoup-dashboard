import { SOURCES } from '../utils/sources.js';

const SOURCE_OPTIONS = [
  { value: SOURCES.TRUSTPILOT, label: 'Trustpilot' },
  { value: SOURCES.REDDIT, label: 'Reddit' },
];

// Switches between independent per-source views - each keeps its own date
// range, filters, and stats rather than merging into one combined feed.
export function SourceTabs({ active, onChange }) {
  return (
    <div className="source-tabs" role="tablist" aria-label="Feedback source">
      {SOURCE_OPTIONS.map((source) => (
        <button
          key={source.value}
          type="button"
          role="tab"
          aria-selected={active === source.value}
          className="source-tabs__tab"
          data-active={active === source.value}
          onClick={() => onChange(source.value)}
        >
          {source.label}
        </button>
      ))}
    </div>
  );
}
