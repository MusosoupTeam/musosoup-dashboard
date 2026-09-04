import { useSourceData } from './useSourceData.js';
import { fetchRedditMentions } from '../api/redditApi.js';

export function useRedditMentions() {
  const { items, applyItemUpdate, ...rest } = useSourceData(fetchRedditMentions);
  return { mentions: items, applyMentionUpdate: applyItemUpdate, ...rest };
}
