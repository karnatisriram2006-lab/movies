import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import "../css/Home.css";
import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  getTopRatedMovies,
  getGenres,
  discoverMovies
} from "../services/api";

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
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
        
        // Pick a random trending movie for the hero
        if (trendingData.results?.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingData.results.length, 5));
          setHeroMovie(trendingData.results[randomIdx]);
        }
      } catch (err) {
        console.error(err);
        setError("failed to load movies...");
      } finally {
        setloading(false);
      }
    };
    loadAllMovies();
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (error) return (
    <div className="error-screen">
      <div className="error-content">
        <h2>⚠️ Something went wrong</h2>
        <p>{error}</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
          This may be a network issue or the movie service is temporarily unavailable. Please try again.
        </p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          🔄 Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="home-netflix">
      <Hero movie={heroMovie} />
      
      <div className="rows-container">
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="Popular on Netflix" movies={popular} />
        <MovieRow title="Top Rated" movies={topRated} />
        <MovieRow title="Upcoming Releases" movies={upcoming} />
      </div>
    </div>
  );
}

export default Home;
