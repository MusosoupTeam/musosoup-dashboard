import { useCallback, useEffect, useState } from 'react';
import { login as loginRequest } from '../api/authApi.js';

// Unlocks "edit mode" for as long as this tab stays on this page load. The
// session credential lives in React state ONLY - never localStorage or
// sessionStorage - so a refresh, a new tab, or navigating away always comes
// back locked. Every write call still carries this token and the server
// re-validates it independently (requireSession.js), so this hook is a UI
// convenience only, never the actual security boundary.
export function useEditSession() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!session) return undefined;
    const timeout = setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [session]);

  const unlock = useCallback(async (password) => {
    setPending(true);
    setError(null);
    try {
      const { token, expiresAt } = await loginRequest(password);
      setSession({ token, expiresAt });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  const lock = useCallback(() => setSession(null), []);

  return { isEditing: !!session, token: session?.token ?? null, unlock, lock, error, pending };
}
