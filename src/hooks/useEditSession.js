import { useCallback, useEffect, useState } from 'react';
import { login as loginRequest } from '../api/authApi.js';

const TOKEN_KEY = 'dashboard_edit_token';
const EXPIRES_KEY = 'dashboard_edit_token_expires';

function readStoredSession() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiresAt = Number(sessionStorage.getItem(EXPIRES_KEY));
    if (token && expiresAt && Date.now() < expiresAt) return { token, expiresAt };
  } catch {
    // sessionStorage unavailable (private browsing, etc.) - edit mode just
    // won't survive a reload; the password prompt still works per-load.
  }
  return null;
}

function clearStoredSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
  } catch {
    // ignore
  }
}

// Unlocks "edit mode" for the browser tab session (sessionStorage, not
// localStorage - gone when the tab closes) once the shared password checks
// out server-side. Every write call still carries this token and the server
// re-validates it independently, so this hook is a UI convenience only, not
// the actual security boundary.
export function useEditSession() {
  const [session, setSession] = useState(readStoredSession);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!session) return undefined;
    const timeout = setTimeout(() => {
      clearStoredSession();
      setSession(null);
    }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [session]);

  const unlock = useCallback(async (password) => {
    setPending(true);
    setError(null);
    try {
      const { token, expiresAt } = await loginRequest(password);
      try {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(EXPIRES_KEY, String(expiresAt));
      } catch {
        // ignore storage failures - session still works for this page life
      }
      setSession({ token, expiresAt });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  const lock = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  return { isEditing: !!session, token: session?.token ?? null, unlock, lock, error, pending };
}
