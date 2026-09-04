import { useCallback, useEffect, useRef, useState } from 'react';

const INITIAL_STATE = { status: 'loading', items: [], fetchedAt: null, error: null };

// Fetches one data source once and keeps it in memory. All filtering, stats,
// and chart derivation happen client-side against this data, so changing a
// filter updates the dashboard instantly with no refetch. Shared by every
// source's hook (useReviews, useRedditMentions, ...) so each just wires in
// its own fetch function.
export function useSourceData(fetchFn) {
  const [state, setState] = useState(INITIAL_STATE);
  const controllerRef = useRef(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({ ...prev, status: prev.items.length ? 'refreshing' : 'loading', error: null }));

    fetchFn({ signal: controller.signal })
      .then(({ items, fetchedAt }) => setState({ status: 'ready', items, fetchedAt, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((prev) => ({ ...prev, status: 'error', error: error.message }));
      });
  }, [fetchFn]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  // After a successful write, the server returns the freshly-read row - this
  // patches it into local state (matched by rowNumber) so the edit shows up
  // immediately without a full refetch.
  const applyItemUpdate = useCallback((rowNumber, updatedItem) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.rowNumber === rowNumber ? updatedItem : item)),
    }));
  }, []);

  return { ...state, refresh: load, applyItemUpdate };
}
