import { listReviews, updateReview, EDITABLE_REVIEW_FIELDS } from './lib/reviewsRepository.js';
import { requireSession } from './lib/requireSession.js';
import { RowConflictError } from './lib/errors.js';
import { json } from './lib/http.js';

// GET /api/reviews - read-only, open to anyone.
// PATCH /api/reviews/:rowNumber - edits one row; requires a valid edit
// session token (see auth.js) even though this file also serves the public
// GET. The transport/repository split still holds: this stays a thin
// handler over reviewsRepository.js, which is the only code that talks to
// the Sheets API.
export default async (request, context) => {
  if (request.method === 'GET') {
    try {
      const reviews = await listReviews();
      return json({ reviews, fetchedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to load reviews from Google Sheets:', error);
      return json({ error: 'Failed to load reviews' }, 502);
    }
  }

  if (request.method === 'PATCH') {
    const rowNumber = Number(context.params.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      return json({ error: 'Invalid review row' }, 400);
    }

    if (!requireSession(request)) {
      return json({ error: 'Edit session required. Unlock edit mode with the dashboard password and try again.' }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }

    const editedBy = (body?.editedBy ?? '').toString().trim();
    if (!editedBy) {
      return json({ error: 'Your name or initials are required to save a change.' }, 400);
    }

    const patch = {};
    for (const field of EDITABLE_REVIEW_FIELDS) {
      if (field in (body ?? {})) patch[field] = (body[field] ?? '').toString();
    }
    if (Object.keys(patch).length === 0) {
      return json({ error: 'No editable fields provided' }, 400);
    }

    try {
      const review = await updateReview({ rowNumber, reviewId: body?.reviewId, patch, editedBy });
      return json({ review });
    } catch (error) {
      if (error instanceof RowConflictError) {
        return json({ error: error.message }, 409);
      }
      console.error('Failed to update review in Google Sheets:', error);
      return json({ error: 'Failed to save changes' }, 502);
    }
  }

  return json({ error: 'Method not allowed' }, 405, { allow: 'GET, PATCH' });
};

export const config = { path: ['/api/reviews', '/api/reviews/:rowNumber'] };
