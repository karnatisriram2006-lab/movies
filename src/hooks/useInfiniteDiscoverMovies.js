import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { discoverMovies } from "../services/api";

const MAX_DISCOVER_PAGE = 500;

export default function useInfiniteDiscoverMovies(filters, enabled = true) {
  const filtersKey = JSON.stringify(filters || {});
  const normalizedFilters = useMemo(() => JSON.parse(filtersKey), [filtersKey]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [sentinel, setSentinel] = useState(null);
  const sentinelRef = useCallback((node) => setSentinel(node), []);
  const requestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const totalPagesRef = useRef(1);
  const retryPageRef = useRef(1);

  const fetchPage = useCallback(async (requestedPage, replace = false) => {
    if (!enabled || loadingRef.current) return;

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    loadingRef.current = true;
    retryPageRef.current = requestedPage;
    setError(null);

    if (requestedPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await discoverMovies(
        { ...normalizedFilters, page: requestedPage },
        { signal: controller.signal },
      );
      if (requestId !== requestIdRef.current) return;

      const results = data.results || [];
      setMovies((currentMovies) => {
        if (replace) return results;
        const existingIds = new Set(currentMovies.map((movie) => movie.id));
        return [...currentMovies, ...results.filter((movie) => !existingIds.has(movie.id))];
      });

      const nextTotalPages = Math.min(data.total_pages || 1, MAX_DISCOVER_PAGE);
      pageRef.current = requestedPage;
      totalPagesRef.current = nextTotalPages;
      setPage(requestedPage);
      setTotalPages(nextTotalPages);
      setTotalResults(data.total_results || 0);
    } catch (requestError) {
      if (requestError.name !== "AbortError" && requestId === requestIdRef.current) {
        setError(requestError.message || "Could not load movies. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [enabled, normalizedFilters]);

  useEffect(() => {
    requestIdRef.current += 1;
    controllerRef.current?.abort();
    loadingRef.current = false;
    pageRef.current = 0;
    totalPagesRef.current = 1;
    setMovies([]);
    setPage(0);
    setTotalPages(1);
    setTotalResults(0);
    setError(null);
    setLoading(Boolean(enabled));
    setLoadingMore(false);

    if (enabled) fetchPage(1, true);

    return () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [enabled, filtersKey, fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || pageRef.current >= totalPagesRef.current) return;
    fetchPage(pageRef.current + 1);
  }, [fetchPage]);

  const retry = useCallback(() => {
    if (loadingRef.current) return;
    const pageToRetry = retryPageRef.current;
    fetchPage(pageToRetry, pageToRetry === 1);
  }, [fetchPage]);

  useEffect(() => {
    if (!enabled || !sentinel || loading || loadingMore || error || page >= totalPages) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: "500px 0px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, error, loading, loadingMore, loadMore, page, sentinel, totalPages]);

  return {
    movies,
    page,
    totalPages,
    totalResults,
    loading,
    loadingMore,
    hasMore: page < totalPages && page < MAX_DISCOVER_PAGE,
    error,
    retry,
    loadMore,
    sentinelRef,
  };
}
