import { useSourceData } from './useSourceData.js';
import { fetchReviews } from '../api/reviewsApi.js';

export function useReviews() {
  const { items, ...rest } = useSourceData(fetchReviews);
  return { reviews: items, ...rest };
}
