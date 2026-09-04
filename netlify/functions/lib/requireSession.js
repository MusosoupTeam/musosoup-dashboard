import { verifySessionToken } from './authSession.js';

// Every write endpoint calls this - a request without a valid, unexpired
// session token is rejected server-side even if it never touched the
// frontend's edit-mode UI at all.
export function requireSession(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return verifySessionToken(token);
}
