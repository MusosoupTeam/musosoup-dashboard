import { buildStatusBreakdown, buildTrend, uniqueStatuses as uniqueStatusesOf } from './aggregate.js';

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
    statusBreakdown: buildStatusBreakdown(reviews, (r) => r.status),
    trend: buildTrend(reviews, (r) => r.datePostedIso),
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

export function uniqueStatuses(reviews) {
  return uniqueStatusesOf(reviews, (r) => r.status);
}
