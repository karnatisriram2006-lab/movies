import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import { SkeletonHero, SkeletonRow } from "../components/SkeletonLoader";
import "../css/Home.css";
import {
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  getOnTheAirTV
} from "../services/api";

function TVPage() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [onTheAir, setOnTheAir] = useState([]);
  const [heroShow, setHeroShow] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllTV = async () => {
      try {
        const [trendingData, popularData, topRatedData, onTheAirData] = await Promise.all([
          getTrendingTV(),
          getPopularTV(),
          getTopRatedTV(),
          getOnTheAirTV()
        ]);

        setTrending(trendingData.results || []);
        setPopular(popularData.results || []);
        setTopRated(topRatedData.results || []);
        setOnTheAir(onTheAirData.results || []);
        
        if (trendingData.results?.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingData.results.length, 5));
          setHeroShow(trendingData.results[randomIdx]);
        }
      } catch (err) {
        console.error("TV load error:", err);
        setError("Failed to load TV shows. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };
    loadAllTV();
  }, []);

  if (loading) return (
    <div className="home-netflix loading">
      <SkeletonHero />
      <div className="rows-container">
        <SkeletonRow title="Trending on TV" />
        <SkeletonRow title="Popular TV Shows" />
        <SkeletonRow title="Top Rated TV" />
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
      <Hero movie={heroShow} mediaType="tv" />
      
      <div className="rows-container">
        <MovieRow title="Trending on TV" movies={trending} mediaType="tv" />
        <MovieRow title="Popular TV Shows" movies={popular} mediaType="tv" />
        <MovieRow title="Top Rated TV" movies={topRated} mediaType="tv" />
        <MovieRow title="Currently On Air" movies={onTheAir} mediaType="tv" />
      </div>
    </div>
  );
}

export default TVPage;
