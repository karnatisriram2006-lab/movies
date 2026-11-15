import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VirtualizedMovieGrid from "../components/VirtualizedMovieGrid";
import Hero from "../components/Hero";
import { SkeletonHero } from "../components/SkeletonLoader";
import useInfiniteDiscoverMovies from "../hooks/useInfiniteDiscoverMovies";
import {
  DEFAULT_MOVIE_SORT,
  readMovieFilters,
  toDiscoverFilters,
  updateMovieFilterParams,
} from "../hooks/movieFilters";
import "../css/Home.css";
import { getPopularMovies, getGenres } from "../services/api";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating (100+ votes)" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "revenue.desc", label: "Revenue" },
  { value: "original_title.asc", label: "Title A-Z" },
];

const LANGUAGE_OPTIONS = [
  ["en", "English"], ["hi", "Hindi"], ["ja", "Japanese"], ["ko", "Korean"],
  ["fr", "French"], ["es", "Spanish"], ["ta", "Tamil"], ["te", "Telugu"],
];

function MoviesPage() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readMovieFilters(searchParams);
  const {
    movies,
    page,
    totalResults,
    loading,
    loadingMore,
    hasMore,
    error,
    retry,
    loadMore,
    sentinelRef,
  } = useInfiniteDiscoverMovies(toDiscoverFilters(filters));

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getPopularMovies(1), getGenres()]).then(([popularResult, genresResult]) => {
      if (cancelled) return;
      if (popularResult.status === "fulfilled") setHeroMovie(popularResult.value.results?.[0] || null);
      if (genresResult.status === "fulfilled") setGenres(genresResult.value.genres || []);
    });
    return () => { cancelled = true; };
  }, []);

  const updateFilter = (key, value) => {
    setSearchParams(updateMovieFilterParams(searchParams, { ...filters, [key]: value }), { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(updateMovieFilterParams(searchParams, {
      genre: "", sortBy: DEFAULT_MOVIE_SORT, year: "", minRating: "", language: "",
    }), { replace: true });
  };

  return (
    <div className="home-netflix">
      {heroMovie ? <Hero movie={heroMovie} /> : <div className="hero-placeholder"><SkeletonHero /></div>}

      <div className="filters-bar movies-filters-bar">
        <div className="filters-panel" id="movies-filters">
          <div className="filter-group">
            <label htmlFor="movies-genre-select">Genre</label>
            <select id="movies-genre-select" value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}>
              <option value="">All genres</option>
              {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="movies-sort-select">Sort by</label>
            <select id="movies-sort-select" value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="movies-year-filter">Release year</label>
            <input id="movies-year-filter" type="number" min="1888" max={new Date().getFullYear() + 5} placeholder="Any year" value={filters.year} onChange={(event) => updateFilter("year", event.target.value)} />
          </div>
          <div className="filter-group">
            <label htmlFor="movies-rating-filter">Minimum rating</label>
            <input id="movies-rating-filter" type="number" min="0" max="10" step="0.5" placeholder="Any rating" value={filters.minRating} onChange={(event) => updateFilter("minRating", event.target.value)} />
          </div>
          <div className="filter-group">
            <label htmlFor="movies-language-filter">Language</label>
            <select id="movies-language-filter" value={filters.language} onChange={(event) => updateFilter("language", event.target.value)}>
              <option value="">Any language</option>
              {LANGUAGE_OPTIONS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>
          <button className="clear-filters-btn" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>

      <div className="filtered-results" aria-busy={loading || loadingMore}>
        <div className="filtered-heading-row">
          <h2 className="section-title">
            {filters.genre ? genres.find((genre) => genre.id === Number(filters.genre))?.name : (filters.year || filters.minRating || filters.language || filters.sortBy !== DEFAULT_MOVIE_SORT) ? "Filtered Movies" : "All Movies"}
            <span className="result-count">({movies.length} of {totalResults})</span>
          </h2>
          <div className="active-filter-list" aria-label="Active filters">
            {filters.genre && <button className="filter-chip" onClick={() => updateFilter("genre", "")}>Genre: {genres.find((genre) => genre.id === Number(filters.genre))?.name || "Selected"} ×</button>}
            {filters.year && <button className="filter-chip" onClick={() => updateFilter("year", "")}>Year: {filters.year} ×</button>}
            {filters.minRating && <button className="filter-chip" onClick={() => updateFilter("minRating", "")}>Rating: {filters.minRating}+ ×</button>}
            {filters.language && <button className="filter-chip" onClick={() => updateFilter("language", "")}>Language: {filters.language.toUpperCase()} ×</button>}
            {filters.sortBy !== DEFAULT_MOVIE_SORT && <button className="filter-chip" onClick={() => updateFilter("sortBy", DEFAULT_MOVIE_SORT)}>Sort: {SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label || filters.sortBy} ×</button>}
          </div>
        </div>

        {loading && !movies.length ? (
          <div className="movies-grid" aria-label="Loading movies">
            {Array.from({ length: 12 }, (_, index) => <div key={index} className="movie-card-skeleton" />)}
          </div>
        ) : (
          <VirtualizedMovieGrid movies={movies} />
        )}
        <div ref={sentinelRef} aria-hidden="true" className="load-more-sentinel" />

        {!loading && !movies.length && !error && <p className="results-status">No movies match these filters.</p>}
        {error && (
          <div className="results-error" role="alert">
            <span>{error}</span>
            <button className="retry-btn" onClick={retry}>Retry</button>
          </div>
        )}
        {loadingMore && <p className="results-status" role="status">Loading more movies…</p>}
        {hasMore && !error && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={loadMore} disabled={loading || loadingMore}>
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </div>
        )}
        {page >= 500 && <p className="results-status">You’ve reached the available page limit.</p>}
      </div>
    </div>
  );
}

export default MoviesPage;
