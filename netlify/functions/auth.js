import { checkPassword, createSessionToken } from './lib/authSession.js';
import { json } from './lib/http.js';

// POST /api/auth/login { password } -> { token, expiresAt }. The password is
// checked here, server-side, against DASHBOARD_EDIT_PASSWORD - never in the
// frontend. The issued token is short-lived and is what every write
// endpoint requires in its Authorization header.
export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { allow: 'POST' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  let valid;
  try {
    valid = checkPassword(body?.password);
  } catch (error) {
    console.error('Edit mode misconfigured:', error);
    return json({ error: 'Edit mode is not configured on this deployment.' }, 500);
  }

  if (!valid) {
    return json({ error: 'Incorrect password' }, 401);
  }

  const { token, expiresAt } = createSessionToken();
  return json({ token, expiresAt });
};

export const config = { path: '/api/auth/login' };
