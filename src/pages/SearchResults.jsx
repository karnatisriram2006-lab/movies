import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/movieCard";
import { SkeletonCard } from "../components/SkeletonLoader";
import SEO from "../components/SEO";
import "../css/Home.css";
import { searchMovies } from "../services/api";

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Handle new search/query
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [q]);

  // Fetch data when page or query changes
  useEffect(() => {
    if (!q) {
      setMovies([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await searchMovies(q, { page });
        const newMovies = data.results || [];
        
        setMovies(prev => page === 1 ? newMovies : [...prev, ...newMovies]);
        setHasMore(newMovies.length > 0 && data.page < data.total_pages);
      } catch (e) {
        console.error("Search error:", e);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchResults();
  }, [q, page]);

  return (
    <div className="home">
      <SEO title={`Search: ${q}`} description={`Search results for ${q}`} />
      <div className="container">
        <h2 style={{ margin: "20px 0", padding: "0 2%" }}>Search results for "{q}"</h2>
        
        {error ? (
          <div className="error-screen" style={{ height: "50vh" }}>
            <div className="error-content">
              <h2>⚠️ Search Error</h2>
              <p>{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="movies-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="movies-grid">
              {movies.map((m, index) => {
                if (movies.length === index + 1) {
                  return (
                    <div ref={lastMovieElementRef} key={m.id}>
                      <MovieCard movie={m} />
                    </div>
                  );
                } else {
                  return <MovieCard movie={m} key={m.id} />;
                }
              })}
            </div>
            {loadingMore && (
              <div className="movies-grid" style={{ marginTop: "20px" }}>
                 {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "#888" }}>
             <p>No movies found for "{q}". Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
