import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import "../css/Home.css";
import {
  searchMovies,
  getPopularMovies,
  discoverMovies,
  getGenres,
} from "../services/api";

function Home() {
  const [searchmovie, setsearchmovie] = useState("");
  const [movies, setmovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    min_rating: "",
    language: "",
    sort_by: "popularity.desc",
  });
  const [error, setError] = useState(null);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setmovies(popularMovies.results || []);
      } catch (err) {
        console.log(err);
        setError("failed to load movies...");
      } finally {
        setloading(false);
      }
    };
    loadPopularMovies();

    const loadGenres = async () => {
      try {
        const g = await getGenres();
        setGenres(g.genres || []);
      } catch (e) {
        console.warn(e);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    if (loading) {
      if (window.announce) window.announce("Loading movies");
    } else if (!loading && movies.length) {
      if (window.announce) window.announce(`${movies.length} movies loaded`);
    }
  }, [loading]);

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!searchmovie.trim()) return;
    if (loading) return;
    if (window.announce)
      window.announce(`Navigating to search for ${searchmovie}`);
    // navigate to unified search results page
    const q = encodeURIComponent(searchmovie.trim());
    window.location.href = `/search?q=${q}`;
  };

  const applyFilters = async (newFilters = filters) => {
    setloading(true);
    if (window.announce) window.announce("Applying filters");
    try {
      const data = await discoverMovies({
        genre: newFilters.genre,
        year: newFilters.year,
        min_rating: newFilters.min_rating,
        language: newFilters.language,
        sort_by: newFilters.sort_by,
        page: 1,
      });
      setmovies(data.results || []);
      setError(null);
      if (window.announce)
        window.announce(`${(data.results || []).length} results`);
    } catch (err) {
      console.error(err);
      setError("failed to load movies with filters...");
      if (window.announce) window.announce("Failed to load filtered results");
    } finally {
      setloading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
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
    setFilters(cleared);
    if (window.announce) window.announce("Filters cleared");
    applyFilters(cleared);
  };
  return (
    <>
      <div className="filters-bar">
        <div className="filter-item">
          <label>Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange("genre", e.target.value)}
          >
            <option value="">All</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Year</label>
          <input
            type="number"
            value={filters.year}
            placeholder="e.g. 2023"
            onChange={(e) => handleFilterChange("year", e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>Min Rating</label>
          <select
            value={filters.min_rating}
            onChange={(e) => handleFilterChange("min_rating", e.target.value)}
          >
            <option value="">Any</option>
            <option value="9">9+</option>
            <option value="8">8+</option>
            <option value="7">7+</option>
            <option value="6">6+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Sort</label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange("sort_by", e.target.value)}
          >
            <option value="popularity.desc">Popularity (desc)</option>
            <option value="popularity.asc">Popularity (asc)</option>
            <option value="primary_release_date.desc">
              Release Date (new → old)
            </option>
            <option value="primary_release_date.asc">
              Release Date (old → new)
            </option>
            <option value="vote_average.desc">Rating (high → low)</option>
            <option value="vote_average.asc">Rating (low → high)</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="home">
          <div className="movies-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="movie-card skeleton" key={`skeleton-${i}`}>
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
        </div>
      ) : (
        <div className="home">
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
