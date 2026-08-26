const MAX_STATUS_SLOTS = 7; // 8th categorical slot is reserved for "Other"
const MONTH_BUCKET_THRESHOLD_DAYS = 60;

export function computeStats(reviews) {
  const total = reviews.length;
  const rated = reviews.filter((r) => r.starRating != null);
  const avgRating = rated.length ? rated.reduce((sum, r) => sum + r.starRating, 0) / rated.length : null;
  const needsActionCount = reviews.filter((r) => r.needsAction).length;
  const contactedCount = reviews.filter((r) => r.dateContactedIso).length;

  return {
    total,
    avgRating,
    ratedCount: rated.length,
    needsActionCount,
    contactedCount,
    ratingDistribution: buildRatingDistribution(reviews),
    statusBreakdown: buildStatusBreakdown(reviews),
    trend: buildTrend(reviews),
  };
}

function buildRatingDistribution(reviews) {
  const counts = new Map([1, 2, 3, 4, 5].map((star) => [star, 0]));
  reviews.forEach((r) => {
    if (r.starRating != null && counts.has(r.starRating)) {
      counts.set(r.starRating, counts.get(r.starRating) + 1);
    }
  });
  return Array.from(counts, ([star, value]) => ({ label: `${star}★`, value }));
}

function buildStatusBreakdown(reviews) {
  const counts = new Map();
  reviews.forEach((r) => {
    const key = r.status || 'Unspecified';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const sorted = Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_STATUS_SLOTS) return sorted;

  const head = sorted.slice(0, MAX_STATUS_SLOTS);
  const otherValue = sorted.slice(MAX_STATUS_SLOTS).reduce((sum, item) => sum + item.value, 0);
  return [...head, { label: 'Other', value: otherValue }];
}

function buildTrend(reviews) {
  const dates = reviews.map((r) => r.datePostedIso).filter(Boolean).sort();
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

export function uniqueStatuses(reviews) {
  const set = new Set(reviews.map((r) => r.status || 'Unspecified'));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
