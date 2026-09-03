import { DateRangePicker } from './DateRangePicker.jsx';
import { MultiSelectDropdown } from './MultiSelectDropdown.jsx';
import { NEEDS_ACTION_OPTIONS } from '../utils/filterReviews.js';

const NEEDS_ACTION_SEGMENTS = [
  { value: NEEDS_ACTION_OPTIONS.ANY, label: 'All' },
  { value: NEEDS_ACTION_OPTIONS.YES, label: 'Needs action' },
  { value: NEEDS_ACTION_OPTIONS.NO, label: 'No action needed' },
];

// Same interaction pattern as FiltersBar, minus the star rating chips - Reddit
// mentions don't carry a rating.
export function RedditFiltersBar({ filters, onChange, statusOptions, resultCount, totalCount }) {
  function patch(update) {
    onChange({ ...filters, ...update });
  }

  return (
    <div className="filters-bar">
      <div className="filters-bar__row">
        <DateRangePicker
          preset={filters.preset}
          customStart={filters.customStart}
          customEnd={filters.customEnd}
          onChange={(update) => patch(update)}
        />

        <MultiSelectDropdown
          label="Status"
          options={statusOptions}
          selected={filters.statuses}
          onChange={(statuses) => patch({ statuses })}
        />

        <div className="segmented" role="group" aria-label="Filter by needs action">
          {NEEDS_ACTION_SEGMENTS.map((segment) => (
            <button
              key={segment.value}
              type="button"
              className="segmented__option"
              data-active={filters.needsAction === segment.value}
              onClick={() => patch({ needsAction: segment.value })}
            >
              {segment.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="filters-bar__search"
          placeholder="Search title, excerpt…"
          value={filters.search}
          onChange={(event) => patch({ search: event.target.value })}
          aria-label="Search Reddit mentions"
        />
      </div>

      <div className="filters-bar__count">
        Showing <strong>{resultCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} mentions
      </div>
    </div>
  );
}
