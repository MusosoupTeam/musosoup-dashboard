import { listRedditMentions, updateRedditMention, EDITABLE_REDDIT_FIELDS } from './lib/redditRepository.js';
import { requireSession } from './lib/requireSession.js';
import { RowConflictError } from './lib/errors.js';
import { json } from './lib/http.js';

// GET /api/reddit-mentions - read-only, open to anyone.
// PATCH /api/reddit-mentions/:rowNumber - edits one row; requires a valid
// edit session token, same pattern as reviews.js.
export default async (request, context) => {
  if (request.method === 'GET') {
    try {
      const mentions = await listRedditMentions();
      return json({ mentions, fetchedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to load Reddit mentions from Google Sheets:', error);
      return json({ error: 'Failed to load Reddit mentions' }, 502);
    }
  }

  if (request.method === 'PATCH') {
    const rowNumber = Number(context.params.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      return json({ error: 'Invalid mention row' }, 400);
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
    for (const field of EDITABLE_REDDIT_FIELDS) {
      if (field in (body ?? {})) patch[field] = (body[field] ?? '').toString();
    }
    if (Object.keys(patch).length === 0) {
      return json({ error: 'No editable fields provided' }, 400);
    }

    try {
      const mention = await updateRedditMention({ rowNumber, postId: body?.postId, patch, editedBy });
      return json({ mention });
    } catch (error) {
      if (error instanceof RowConflictError) {
        return json({ error: error.message }, 409);
      }
      console.error('Failed to update Reddit mention in Google Sheets:', error);
      return json({ error: 'Failed to save changes' }, 502);
    }
  }

  return json({ error: 'Method not allowed' }, 405, { allow: 'GET, PATCH' });
};

export const config = { path: ['/api/reddit-mentions', '/api/reddit-mentions/:rowNumber'] };
