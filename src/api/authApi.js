// Thin wrapper for the edit-mode password check. The password itself is
// never evaluated here - it's sent once to the server and this only ever
// sees the resulting short-lived token.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function login(password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Login failed');
  return body; // { token, expiresAt }
}
