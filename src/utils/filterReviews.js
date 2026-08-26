export const NEEDS_ACTION_OPTIONS = {
  ANY: 'any',
  YES: 'yes',
  NO: 'no',
};

export function defaultFilters() {
  return {
    preset: 'last30',
    customStart: null,
    customEnd: null,
    ratings: new Set(),
    statuses: new Set(),
    needsAction: NEEDS_ACTION_OPTIONS.ANY,
    search: '',
  };
}

export function filterReviews(reviews, { start, end, ratings, statuses, needsAction, search }) {
  const term = search.trim().toLowerCase();

  return reviews.filter((review) => {
    if (start && (!review.datePostedIso || review.datePostedIso < start)) return false;
    if (end && (!review.datePostedIso || review.datePostedIso > end)) return false;
    if (ratings.size > 0 && !ratings.has(review.starRating)) return false;
    if (statuses.size > 0 && !statuses.has(review.status || 'Unspecified')) return false;
    if (needsAction === NEEDS_ACTION_OPTIONS.YES && !review.needsAction) return false;
    if (needsAction === NEEDS_ACTION_OPTIONS.NO && review.needsAction) return false;

    if (term) {
      const haystack = `${review.reviewerName} ${review.reviewText} ${review.notes} ${review.assignedTo}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  });
}
