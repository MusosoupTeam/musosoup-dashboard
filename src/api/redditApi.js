// Thin wrapper around the Netlify Functions data-access layer for the Reddit
// Mentions source - mirrors reviewsApi.js. Normalizes to { items, fetchedAt }
// so both sources share the same useSourceData hook.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function fetchRedditMentions({ signal } = {}) {
  const response = await fetch(`${API_BASE}/reddit-mentions`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  const body = await response.json();
  return { items: body.mentions, fetchedAt: body.fetchedAt };
}

// Edit-mode write - requires a valid session token (see useEditSession).
export async function updateRedditMention({ rowNumber, postId, patch, editedBy, token }) {
  const response = await fetch(`${API_BASE}/reddit-mentions/${rowNumber}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ postId, editedBy, ...patch }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body.mention;
}
