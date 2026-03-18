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
  getGenres
} from "../services/api";

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [genres, setGenres] = useState([]);
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
        
        if (trendingData.results?.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingData.results.length, 5));
          setHeroMovie(trendingData.results[randomIdx]);
        }
      } catch (err) {
        console.error("Home load error:", err);
        setError("Failed to load movie collections. Please check your internet connection.");
      } finally {
        setloading(false);
      }
    };
    loadAllMovies();
  }, []);

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
        <h2>⚠️ Service Unavailable</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          🔄 Refresh Page
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
