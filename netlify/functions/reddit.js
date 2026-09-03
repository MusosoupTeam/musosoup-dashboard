import { listRedditMentions } from './lib/redditRepository.js';

// GET /api/reddit-mentions - read-only, same pattern as reviews.js. Kept as
// its own handler + repository pair (rather than folded into reviews.js) so
// each feedback source's read path - and any future write endpoint for it -
// stays independent of the other.
export default async (request) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', allow: 'GET' },
    });
  }

  try {
    const mentions = await listRedditMentions();
    return new Response(JSON.stringify({ mentions, fetchedAt: new Date().toISOString() }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to load Reddit mentions from Google Sheets:', error);
    return new Response(JSON.stringify({ error: 'Failed to load Reddit mentions' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const config = { path: '/api/reddit-mentions' };
