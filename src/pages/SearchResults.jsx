import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/movieCard";
import "../css/Home.css";
import { searchMovies } from "../services/api";

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!q) {
        setMovies([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchMovies(q);
        if (mounted) setMovies(data.results || []);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Failed to search.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => (mounted = false);
  }, [q]);

  return (
    <div className="home">
      <h2>Search results for "{q}"</h2>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="movies-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="movie-card skeleton" key={`s-${i}`}>
              <div className="movie-poster">
                <div className="skeleton-poster" />
              </div>
              <div className="movie-info">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((m) => (
            <MovieCard movie={m} key={m.id} />
          ))}
        </div>
      )}
    </div>
  );
}
