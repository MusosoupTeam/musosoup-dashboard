import { useEffect, useRef, useState } from 'react';

export function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(option) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(next);
  }

  const summary = selected.size === 0 ? 'All' : selected.size === 1 ? Array.from(selected)[0] : `${selected.size} selected`;

  return (
    <div className="multi-select" ref={rootRef}>
      <button type="button" className="multi-select__trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="multi-select__label">{label}</span>
        <span className="multi-select__summary">{summary}</span>
      </button>

      {open && (
        <div className="multi-select__menu" role="menu">
          {selected.size > 0 && (
            <button type="button" className="multi-select__clear" onClick={() => onChange(new Set())}>
              Clear
            </button>
          )}
          {options.length === 0 && <div className="multi-select__empty">No options</div>}
          {options.map((option) => (
            <label key={option} className="multi-select__row">
              <input type="checkbox" checked={selected.has(option)} onChange={() => toggle(option)} />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
