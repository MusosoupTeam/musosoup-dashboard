// Thin wrapper around the Netlify Functions data-access layer. Every read
// goes through here so the transport detail (fetch, base path) lives in one
// place; a future write call (e.g. updateReview) would live alongside it.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function fetchReviews({ signal } = {}) {
  const response = await fetch(`${API_BASE}/reviews`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}
