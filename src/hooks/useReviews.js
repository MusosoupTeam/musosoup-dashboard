import { useSourceData } from './useSourceData.js';
import { fetchReviews } from '../api/reviewsApi.js';

export function useReviews() {
  const { items, applyItemUpdate, ...rest } = useSourceData(fetchReviews);
  return { reviews: items, applyReviewUpdate: applyItemUpdate, ...rest };
}
