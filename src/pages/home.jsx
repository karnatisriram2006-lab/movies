import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VirtualizedMovieGrid from "../components/VirtualizedMovieGrid";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import { SkeletonHero, SkeletonRow } from "../components/SkeletonLoader";
import useInfiniteDiscoverMovies from "../hooks/useInfiniteDiscoverMovies";
import {
  DEFAULT_MOVIE_SORT,
  hasMovieFilters,
  readMovieFilters,
  toDiscoverFilters,
  updateMovieFilterParams,
} from "../hooks/movieFilters";
import "../css/Home.css";
import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  getTopRatedMovies,
  getGenres,
} from "../services/api";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating (100+ votes)" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "original_title.asc", label: "Title A-Z" },
];

const LANGUAGE_OPTIONS = [
  ["en", "English"], ["hi", "Hindi"], ["ja", "Japanese"], ["ko", "Korean"],
  ["fr", "French"], ["es", "Spanish"], ["ta", "Tamil"], ["te", "Telugu"],
];

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readMovieFilters(searchParams);
  const activeFilters = hasMovieFilters(filters);
  const {
    movies: filteredMovies,
    page: filteredPage,
    totalResults: filteredTotalResults,
    loading: filterLoading,
    loadingMore,
    hasMore,
    error: filterError,
    retry: retryFilters,
    loadMore,
    sentinelRef,
  } = useInfiniteDiscoverMovies(toDiscoverFilters(filters), activeFilters);
  const [showFilters, setShowFilters] = useState(activeFilters);

  useEffect(() => {
    let cancelled = false;
    const loadCollections = async () => {
      const results = await Promise.allSettled([
        getTrendingMovies(),
        getPopularMovies(),
        getUpcomingMovies(),
        getTopRatedMovies(),
        getGenres(),
      ]);
      if (cancelled) return;

      const [trendingResult, popularResult, upcomingResult, topRatedResult, genresResult] = results;
      const fulfilled = (result) => result.status === "fulfilled" ? result.value : null;
      const trendingData = fulfilled(trendingResult);
      const popularData = fulfilled(popularResult);
      const upcomingData = fulfilled(upcomingResult);
      const topRatedData = fulfilled(topRatedResult);
      const genresData = fulfilled(genresResult);

      setTrending(trendingData?.results || []);
      setPopular(popularData?.results || []);
      setUpcoming(upcomingData?.results || []);
      setTopRated(topRatedData?.results || []);
      setGenres(genresData?.genres || []);

      if (trendingData?.results?.length) {
        const randomIdx = Math.floor(Math.random() * Math.min(trendingData.results.length, 5));
        setHeroMovie(trendingData.results[randomIdx]);
      }

      const collectionFailures = results.slice(0, 4).filter((result) => result.status === "rejected").length;
      const requestFailures = results.filter((result) => result.status === "rejected").length;
      if (collectionFailures === 4) {
        setError("Movie collections could not be loaded. Check your connection and try again.");
      } else if (requestFailures) {
        setCollectionMessage("Some movie collections or filter options could not be loaded.");
      }
      setLoading(false);
    };

    loadCollections();
    return () => { cancelled = true; };
  }, []);

  const updateFilter = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setSearchParams(updateMovieFilterParams(searchParams, nextFilters), { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(updateMovieFilterParams(searchParams, {
      genre: "", sortBy: DEFAULT_MOVIE_SORT, year: "", minRating: "", language: "",
    }), { replace: true });
  };

  if (loading) return (
    <div className="home-netflix loading">
      <SkeletonHero />
      <div className="rows-container">
        <SkeletonRow title="Trending Now" />
        <SkeletonRow title="Popular on Netflix" />
        <SkeletonRow title="Top Rated" />
      </div>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-content">
        <h2>Service Unavailable</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    </div>
  );

  return (
    <div className="home-netflix">
      <Hero movie={heroMovie} />

      <div className="filters-bar">
        <button
          className="filter-toggle"
          aria-expanded={showFilters}
          aria-controls="home-movie-filters"
          onClick={() => setShowFilters((visible) => !visible)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {showFilters && (
          <div className="filters-panel" id="home-movie-filters">
            <div className="filter-group">
              <label htmlFor="home-genre-select">Genre</label>
              <select id="home-genre-select" value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}>
                <option value="">All genres</option>
                {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="home-sort-select">Sort by</label>
              <select id="home-sort-select" value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="home-year-filter">Release year</label>
              <input id="home-year-filter" type="number" min="1888" max={new Date().getFullYear() + 5} placeholder="Any year" value={filters.year} onChange={(event) => updateFilter("year", event.target.value)} />
            </div>

            <div className="filter-group">
              <label htmlFor="home-rating-filter">Minimum rating</label>
              <input id="home-rating-filter" type="number" min="0" max="10" step="0.5" placeholder="Any rating" value={filters.minRating} onChange={(event) => updateFilter("minRating", event.target.value)} />
            </div>

            <div className="filter-group">
              <label htmlFor="home-language-filter">Language</label>
              <select id="home-language-filter" value={filters.language} onChange={(event) => updateFilter("language", event.target.value)}>
                <option value="">Any language</option>
                {LANGUAGE_OPTIONS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>

            {activeFilters && <button className="clear-filters-btn" onClick={clearFilters}>Clear filters</button>}
          </div>
        )}
      </div>

      {activeFilters ? (
        <div className="filtered-results" aria-busy={filterLoading || loadingMore}>
          <div className="filtered-heading-row">
            <h2 className="section-title">
              {filters.genre ? genres.find((genre) => genre.id === Number(filters.genre))?.name : "Filtered movies"}
              <span className="result-count">({filteredMovies.length} of {filteredTotalResults})</span>
            </h2>
            <div className="active-filter-list" aria-label="Active filters">
              {filters.genre && <button className="filter-chip" onClick={() => updateFilter("genre", "")}>Genre: {genres.find((genre) => genre.id === Number(filters.genre))?.name || "Selected"} ×</button>}
              {filters.year && <button className="filter-chip" onClick={() => updateFilter("year", "")}>Year: {filters.year} ×</button>}
              {filters.minRating && <button className="filter-chip" onClick={() => updateFilter("minRating", "")}>Rating: {filters.minRating}+ ×</button>}
              {filters.language && <button className="filter-chip" onClick={() => updateFilter("language", "")}>Language: {filters.language.toUpperCase()} ×</button>}
              {filters.sortBy !== DEFAULT_MOVIE_SORT && <button className="filter-chip" onClick={() => updateFilter("sortBy", DEFAULT_MOVIE_SORT)}>Sort: {SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label || filters.sortBy} ×</button>}
            </div>
          </div>

          <VirtualizedMovieGrid movies={filteredMovies} className="filtered-grid" />
          <div ref={sentinelRef} aria-hidden="true" className="load-more-sentinel" />

          {filterLoading && <p className="results-status" role="status">Loading movies…</p>}
          {!filterLoading && !filteredMovies.length && !filterError && <p className="results-status">No movies match these filters.</p>}
          {filterError && (
            <div className="results-error" role="alert">
              <span>{filterError}</span>
              <button className="retry-btn" onClick={retryFilters}>Retry</button>
            </div>
          )}
          {loadingMore && <p className="results-status" role="status">Loading more movies…</p>}
          {hasMore && !filterError && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMore} disabled={filterLoading || loadingMore}>
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
          {filteredPage >= 500 && <p className="results-status">You’ve reached the available page limit.</p>}
        </div>
      ) : (
        <div className="rows-container">
          {collectionMessage && <p className="results-status" role="status">{collectionMessage}</p>}
          {trending.length > 0 && <MovieRow title="Trending Now" movies={trending} />}
          {popular.length > 0 && <MovieRow title="Popular on Netflix" movies={popular} />}
          {topRated.length > 0 && <MovieRow title="Top Rated" movies={topRated} />}
          {upcoming.length > 0 && <MovieRow title="Upcoming Releases" movies={upcoming} />}
        </div>
      )}
    </div>
  );
}

export default Home;
