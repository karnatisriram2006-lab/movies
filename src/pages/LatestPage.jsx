import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import Hero from "../components/Hero";
import { SkeletonHero } from "../components/SkeletonLoader";
import "../css/Home.css";
import {
  getUpcomingMovies,
  getTopRatedMovies,
  getTrendingMovies
} from "../services/api";

function LatestPage() {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");

  const tabContent = {
    trending: trending,
    upcoming: upcoming,
    toprated: topRated
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [trendingData, upcomingData, topRatedData] = await Promise.all([
          getTrendingMovies(),
          getUpcomingMovies(),
          getTopRatedMovies()
        ]);

        setTrending(trendingData.results || []);
        setUpcoming(upcomingData.results || []);
        setTopRated(topRatedData.results || []);
        
        if (trendingData.results?.length > 0) {
          setHeroMovie(trendingData.results[0]);
        }
      } catch (err) {
        console.error("Latest load error:", err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading) return (
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
      
      <div className="tab-bar">
        <button 
          className={`tab-btn ${activeTab === "trending" ? "active" : ""}`}
          onClick={() => setActiveTab("trending")}
        >
          Trending
        </button>
        <button 
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Coming Soon
        </button>
        <button 
          className={`tab-btn ${activeTab === "toprated" ? "active" : ""}`}
          onClick={() => setActiveTab("toprated")}
        >
          Top Rated
        </button>
      </div>

      <div className="filtered-results">
        <h2 className="section-title">
          {activeTab === "trending" ? "Trending Today" : activeTab === "upcoming" ? "Coming Soon" : "Top Rated"}
        </h2>
        <div className="movies-grid">
          {tabContent[activeTab]?.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LatestPage;
