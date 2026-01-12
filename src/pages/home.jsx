import { useState, useEffect } from "react";
import MovieGrid from "../components/MovieGrid";
import FilterBar from "../components/FilterBar";
import "../css/Home.css";
import {
  getPopularMovies,
  discoverMovies,
  getGenres,
} from "../services/api";

function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    min_rating: "",
    language: "",
    sort_by: "popularity.desc",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadMovies = async (page, currentFilters) => {
    setLoading(true);
    try {
      const data = await discoverMovies({ ...currentFilters, page });
      setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load movies...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies(page, filters);
  }, [page]);

  useEffect(() => {
    const loadGenresAsync = async () => {
      try {
        const g = await getGenres();
        setGenres(g.genres || []);
      } catch (e) {
        console.warn(e);
      }
    };
    loadGenresAsync();
  }, []);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 500 ||
      loading
    ) {
      return;
    }
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    loadMovies(1, newFilters);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const clearFilters = () => {
    const cleared = {
      genre: "",
      year: "",
      min_rating: "",
      language: "",
      sort_by: "popularity.desc",
    };
    applyFilters(cleared);
  };

  return (
    <>
      <FilterBar
        filters={filters}
        genres={genres}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      <MovieGrid movies={movies} loading={loading && page === 1} />
      {loading && page > 1 && <div className="loading-indicator">Loading more...</div>}
    </>
  );
}

export default Home;
