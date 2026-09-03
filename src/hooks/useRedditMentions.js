import { useSourceData } from './useSourceData.js';
import { fetchRedditMentions } from '../api/redditApi.js';

export function useRedditMentions() {
  const { items, ...rest } = useSourceData(fetchRedditMentions);
  return { mentions: items, ...rest };
}
