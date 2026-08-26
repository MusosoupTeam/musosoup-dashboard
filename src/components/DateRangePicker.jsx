import { useEffect, useRef, useState } from 'react';
import { RANGE_PRESET_OPTIONS, RANGE_PRESETS, resolveDateRange } from '../utils/dateRanges.js';

function formatRangeLabel(preset, range) {
  const preset_ = RANGE_PRESET_OPTIONS.find((option) => option.value === preset);
  if (preset !== RANGE_PRESETS.CUSTOM) return preset_?.label ?? 'Select range';
  if (!range.start || !range.end) return 'Custom range';
  return `${range.start} → ${range.end}`;
}

export function DateRangePicker({ preset, customStart, customEnd, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const range = resolveDateRange(preset, { start: customStart, end: customEnd });

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectPreset(value) {
    onChange({ preset: value });
    if (value !== RANGE_PRESETS.CUSTOM) setOpen(false);
  }

  return (
    <div className="date-range-picker" ref={rootRef}>
      <button type="button" className="date-range-picker__trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="date-range-picker__label">{formatRangeLabel(preset, range)}</span>
        <span className="date-range-picker__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="date-range-picker__menu" role="menu">
          {RANGE_PRESET_OPTIONS.filter((option) => option.value !== RANGE_PRESETS.CUSTOM).map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={preset === option.value}
              className="date-range-picker__row"
              onClick={() => selectPreset(option.value)}
            >
              <span className="date-range-picker__check" aria-hidden="true">
                {preset === option.value ? '✓' : ''}
              </span>
              {option.label}
            </button>
          ))}

          <div className="date-range-picker__footer">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={preset === RANGE_PRESETS.CUSTOM}
              className="date-range-picker__row"
              onClick={() => selectPreset(RANGE_PRESETS.CUSTOM)}
            >
              <span className="date-range-picker__check" aria-hidden="true">
                {preset === RANGE_PRESETS.CUSTOM ? '✓' : ''}
              </span>
              Custom range
            </button>
            <div className="date-range-picker__custom">
              <label>
                From
                <input
                  type="date"
                  value={customStart ?? ''}
                  onChange={(event) => onChange({ preset: RANGE_PRESETS.CUSTOM, customStart: event.target.value || null })}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={customEnd ?? ''}
                  onChange={(event) => onChange({ preset: RANGE_PRESETS.CUSTOM, customEnd: event.target.value || null })}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
