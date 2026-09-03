// Shared aggregation helpers used by every source's stats module (stats.js
// for Trustpilot reviews, redditStats.js for Reddit mentions). Each source
// passes its own accessor so the bucketing/folding logic stays in one place.

const MAX_STATUS_SLOTS = 7; // 8th categorical slot is reserved for "Other"
const MONTH_BUCKET_THRESHOLD_DAYS = 60;

export function buildStatusBreakdown(items, getStatus) {
  const counts = new Map();
  items.forEach((item) => {
    const key = getStatus(item) || 'Unspecified';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const sorted = Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_STATUS_SLOTS) return sorted;

  const head = sorted.slice(0, MAX_STATUS_SLOTS);
  const otherValue = sorted.slice(MAX_STATUS_SLOTS).reduce((sum, item) => sum + item.value, 0);
  return [...head, { label: 'Other', value: otherValue }];
}

export function buildTrend(items, getDateIso) {
  const dates = items.map(getDateIso).filter(Boolean).sort();
  if (dates.length === 0) return { bucket: 'day', points: [] };

  const spanDays = (new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86_400_000;
  const bucket = spanDays > MONTH_BUCKET_THRESHOLD_DAYS ? 'month' : 'day';

  const counts = new Map();
  dates.forEach((iso) => {
    const key = bucket === 'month' ? iso.slice(0, 7) : iso;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const points = Array.from(counts, ([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
  return { bucket, points };
}

export function uniqueStatuses(items, getStatus) {
  const set = new Set(items.map((item) => getStatus(item) || 'Unspecified'));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
