import { NEEDS_ACTION_OPTIONS } from './filterReviews.js';

export function defaultRedditFilters() {
  return {
    preset: 'last30',
    customStart: null,
    customEnd: null,
    statuses: new Set(),
    needsAction: NEEDS_ACTION_OPTIONS.ANY,
    search: '',
  };
}

// Same interaction pattern as filterReviews - date range, Status,
// Needs Action, text search - minus the rating filter, since Reddit
// mentions don't have a star rating.
export function filterRedditMentions(mentions, { start, end, statuses, needsAction, search }) {
  const term = search.trim().toLowerCase();

  return mentions.filter((mention) => {
    if (start && (!mention.datePostedIso || mention.datePostedIso < start)) return false;
    if (end && (!mention.datePostedIso || mention.datePostedIso > end)) return false;
    if (statuses.size > 0 && !statuses.has(mention.status || 'Unspecified')) return false;
    if (needsAction === NEEDS_ACTION_OPTIONS.YES && !mention.needsAction) return false;
    if (needsAction === NEEDS_ACTION_OPTIONS.NO && mention.needsAction) return false;

    if (term) {
      const haystack = `${mention.title} ${mention.excerpt}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  });
}
