export function formatCompactNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatRating(value) {
  return value == null ? '—' : value.toFixed(1);
}

export function formatPercent(numerator, denominator) {
  if (!denominator) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function formatBucketLabel(iso, bucket) {
  if (bucket === 'month') {
    const [year, month] = iso.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
