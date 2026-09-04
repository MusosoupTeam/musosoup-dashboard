// Thin wrapper around the Netlify Functions data-access layer. Every read
// goes through here so the transport detail (fetch, base path) lives in one
// place; a future write call (e.g. updateReview) would live alongside it.
// Normalizes to { items, fetchedAt } so this source shares useSourceData
// with other sources (e.g. Reddit mentions).
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function fetchReviews({ signal } = {}) {
  const response = await fetch(`${API_BASE}/reviews`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  const body = await response.json();
  return { items: body.reviews, fetchedAt: body.fetchedAt };
}

// Edit-mode write - requires a valid session token (see useEditSession).
// The server re-validates the token independently; this just carries it.
export async function updateReview({ rowNumber, reviewId, patch, editedBy, token }) {
  const response = await fetch(`${API_BASE}/reviews/${rowNumber}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ reviewId, editedBy, ...patch }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body.review;
}
