const TONE_KEYWORDS = [
  { tone: 'good', words: ['resolved', 'closed', 'done', 'complete', 'responded'] },
  { tone: 'warning', words: ['pending', 'in progress', 'in review', 'waiting', 'contacted'] },
  { tone: 'critical', words: ['urgent', 'escalated', 'critical'] },
  { tone: 'serious', words: ['flagged', 'negative', 'new'] },
];

function toneForStatus(status) {
  const lower = (status || '').toLowerCase();
  for (const { tone, words } of TONE_KEYWORDS) {
    if (words.some((word) => lower.includes(word))) return tone;
  }
  return 'neutral';
}

// Status values are free text from the sheet, so we only color-code the
// common ones; anything unrecognized falls back to a neutral badge. Color
// never carries the meaning alone - the label text is always present too.
export function StatusBadge({ status }) {
  const tone = toneForStatus(status);
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {status || 'Unspecified'}
    </span>
  );
}

export function NeedsActionBadge({ needsAction }) {
  if (!needsAction) return <span className="status-badge status-badge--neutral-quiet">—</span>;
  return (
    <span className="status-badge status-badge--critical">
      <span className="status-badge__dot" aria-hidden="true" />
      Needs action
    </span>
  );
}
