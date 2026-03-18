import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/movieCard";
import { SkeletonCard } from "../components/SkeletonLoader";
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
          <div className="movies-grid">
            {movies.map((m) => (
              <MovieCard movie={m} key={m.id} />
            ))}
          </div>
        ) : (
          <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "#888" }}>
             <p>No movies found for "{q}". Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
