import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchReviews } from '../api/reviewsApi.js';

const INITIAL_STATE = { status: 'loading', reviews: [], fetchedAt: null, error: null };

// Fetches the full review set once and keeps it in memory. All filtering,
// stats, and chart derivation happen client-side against this data, so
// changing a filter updates the dashboard instantly with no refetch.
export function useReviews() {
  const [state, setState] = useState(INITIAL_STATE);
  const controllerRef = useRef(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({ ...prev, status: prev.reviews.length ? 'refreshing' : 'loading', error: null }));

    fetchReviews({ signal: controller.signal })
      .then(({ reviews, fetchedAt }) => setState({ status: 'ready', reviews, fetchedAt, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((prev) => ({ ...prev, status: 'error', error: error.message }));
      });
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { ...state, refresh: load };
}
