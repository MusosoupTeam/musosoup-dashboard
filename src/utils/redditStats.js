import { buildStatusBreakdown, buildTrend, uniqueStatuses } from './aggregate.js';

// Mirrors stats.js for the Reddit Mentions source. No rating fields - Reddit
// mentions have no star rating - and stats are computed from whatever slice
// of mentions is passed in, so Trustpilot and Reddit totals never mix.
export function computeRedditStats(mentions) {
  const total = mentions.length;
  const needsActionCount = mentions.filter((m) => m.needsAction).length;

  return {
    total,
    needsActionCount,
    statusBreakdown: buildStatusBreakdown(mentions, (m) => m.status),
    trend: buildTrend(mentions, (m) => m.datePostedIso),
  };
}

export function uniqueRedditStatuses(mentions) {
  return uniqueStatuses(mentions, (m) => m.status);
}
