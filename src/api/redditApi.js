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
