import { listReviews } from './lib/reviewsRepository.js';

// GET /api/reviews - the only endpoint this read-only POC exposes.
// Kept as a thin transport layer over reviewsRepository so a future write
// endpoint (e.g. PATCH /api/reviews/:id for status updates) can be added as
// its own handler + repository function without touching this one.
export default async (request) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', allow: 'GET' },
    });
  }

  try {
    const reviews = await listReviews();
    return new Response(JSON.stringify({ reviews, fetchedAt: new Date().toISOString() }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to load reviews from Google Sheets:', error);
    return new Response(JSON.stringify({ error: 'Failed to load reviews' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const config = { path: '/api/reviews' };
