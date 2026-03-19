import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import Hero from "../components/Hero";
import { SkeletonHero } from "../components/SkeletonLoader";
import "../css/Home.css";
import {
  getPopularMovies,
  getGenres,
  discoverMovies
} from "../services/api";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "revenue.desc", label: "Revenue" },
];

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Genres load error:", err);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const popularData = await getPopularMovies(1);
        if (popularData.results?.length > 0) {
          setHeroMovie(popularData.results[0]);
        }
      } catch (err) {
        console.error("Movies load error:", err);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    const loadFiltered = async () => {
      setLoading(true);
      try {
        const data = await discoverMovies({ genre: selectedGenre, sort_by: sortBy, page });
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Filter error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFiltered();
  }, [selectedGenre, sortBy, page]);

  if (loading && !movies.length) return (
    <div className="home-netflix loading">
      <SkeletonHero />
      <div className="filtered-results">
        <div className="movies-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="movie-card-skeleton"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-content">
        <h2>Service Unavailable</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="home-netflix">
      <Hero movie={heroMovie} />
      
      <div className="filters-bar">
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="genre-select">Genre:</label>
            <select id="genre-select" value={selectedGenre || ""} onChange={(e) => { setSelectedGenre(e.target.value || null); setPage(1); }}>
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort-select">Sort By:</label>
            <select id="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="filtered-results">
        <h2 className="section-title">
          {selectedGenre ? genres.find(g => g.id === parseInt(selectedGenre))?.name : "All Movies"}
          <span className="result-count">({movies.length} of {totalPages * 20})</span>
        </h2>
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        {totalPages > 1 && page < totalPages && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={() => setPage(p => p + 1)} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MoviesPage;
