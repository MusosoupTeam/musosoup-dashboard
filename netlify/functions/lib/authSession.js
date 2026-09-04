import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours - matches the browser-session-only intent

function password() {
  const value = process.env.DASHBOARD_EDIT_PASSWORD;
  if (!value) {
    throw new Error('Missing DASHBOARD_EDIT_PASSWORD environment variable - edit mode is not configured.');
  }
  return value;
}

function sign(payload) {
  return createHmac('sha256', password()).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * The shared edit password, checked server-side only - the frontend never
 * sees or evaluates it. Signing uses the same secret so no second env var
 * is needed for a single-password POC; the password itself never appears
 * in the issued token, only an HMAC of the expiry.
 */
export function checkPassword(candidate) {
  return safeEqual(String(candidate ?? ''), password());
}

export function createSessionToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!safeEqual(signature, sign(payload))) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
