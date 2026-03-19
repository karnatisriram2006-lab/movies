import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import { SkeletonHero, SkeletonRow } from "../components/SkeletonLoader";
import "../css/Home.css";
import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  getTopRatedMovies,
  getGenres,
  discoverMovies
} from "../services/api";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "title.asc", label: "Title A-Z" },
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
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadAllMovies = async () => {
      try {
        const [trendingData, popularData, upcomingData, topRatedData, genresData] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getUpcomingMovies(),
          getTopRatedMovies(),
          getGenres()
        ]);

        setTrending(trendingData.results || []);
        setPopular(popularData.results || []);
        setUpcoming(upcomingData.results || []);
        setTopRated(topRatedData.results || []);
        setGenres(genresData.genres || []);
        
        if (trendingData.results?.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingData.results.length, 5));
          setHeroMovie(trendingData.results[randomIdx]);
        }
      } catch (err) {
        console.error("Home load error:", err);
        setError("Failed to load movie collections. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };
    loadAllMovies();
  }, []);

  useEffect(() => {
    const loadFiltered = async () => {
      if (selectedGenre) {
        setLoading(true);
        try {
          const data = await discoverMovies({ genre: selectedGenre, sort_by: sortBy });
          setFilteredMovies(data.results || []);
        } catch (err) {
          console.error("Filter error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredMovies([]);
      }
    };
    loadFiltered();
  }, [selectedGenre, sortBy]);

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setSelectedGenre(value === "" ? null : value);
  };

  if (loading && !filteredMovies.length) return (
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
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label htmlFor="genre-select">Genre:</label>
              <select id="genre-select" value={selectedGenre || ""} onChange={handleGenreChange}>
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sort-select">Sort By:</label>
              <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {filteredMovies.length > 0 ? (
        <div className="filtered-results">
          <h2 className="section-title">
            {genres.find(g => g.id === parseInt(selectedGenre))?.name || "Results"} 
            <span className="result-count">({filteredMovies.length})</span>
          </h2>
          <div className="filtered-grid">
            {filteredMovies.slice(0, 20).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rows-container">
          <MovieRow title="Trending Now" movies={trending} />
          <MovieRow title="Popular on Netflix" movies={popular} />
          <MovieRow title="Top Rated" movies={topRated} />
          <MovieRow title="Upcoming Releases" movies={upcoming} />
        </div>
      )}
    </div>
  );
}

export default Home;
