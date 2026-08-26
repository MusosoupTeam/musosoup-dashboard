import { DateRangePicker } from './DateRangePicker.jsx';
import { MultiSelectDropdown } from './MultiSelectDropdown.jsx';
import { NEEDS_ACTION_OPTIONS } from '../utils/filterReviews.js';

const STAR_OPTIONS = [1, 2, 3, 4, 5];
const NEEDS_ACTION_SEGMENTS = [
  { value: NEEDS_ACTION_OPTIONS.ANY, label: 'All' },
  { value: NEEDS_ACTION_OPTIONS.YES, label: 'Needs action' },
  { value: NEEDS_ACTION_OPTIONS.NO, label: 'No action needed' },
];

export function FiltersBar({ filters, onChange, statusOptions, resultCount, totalCount }) {
  function patch(update) {
    onChange({ ...filters, ...update });
  }

  function toggleRating(star) {
    const next = new Set(filters.ratings);
    if (next.has(star)) next.delete(star);
    else next.add(star);
    patch({ ratings: next });
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

        <div className="rating-filter" role="group" aria-label="Filter by star rating">
          {STAR_OPTIONS.map((star) => (
            <button
              key={star}
              type="button"
              className="rating-filter__chip"
              data-active={filters.ratings.has(star)}
              onClick={() => toggleRating(star)}
            >
              {star}★
            </button>
          ))}
        </div>

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
          placeholder="Search reviewer, text, notes…"
          value={filters.search}
          onChange={(event) => patch({ search: event.target.value })}
          aria-label="Search reviews"
        />
      </div>

      <div className="filters-bar__count">
        Showing <strong>{resultCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} reviews
      </div>
    </div>
  );
}
