import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieVideos } from "../services/api";
import "../css/Hero.css";

function Hero({ movie }) {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // Pre-fetch trailer key whenever movie changes
  useEffect(() => {
    setTrailerKey(null);
    if (!movie?.id) return;
    getMovieVideos(movie.id)
      .then((data) => {
        const videos = data.results || [];
        const trailer =
          videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
          videos.find((v) => v.site === "YouTube");
        if (trailer) setTrailerKey(trailer.key);
      })
      .catch(() => {});
  }, [movie?.id]);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setShowTrailer(false);
  }, []);

  useEffect(() => {
    if (showTrailer) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showTrailer, handleKeyDown]);

  if (!movie) return null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  const handlePlay = () => {
    if (trailerKey) {
      setShowTrailer(true);
    } else {
      // Fallback: go to movie detail if no trailer found
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <div
        className="hero"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 100%), url(${backdropUrl})`,
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">{movie.title || movie.name}</h1>
          <p className="hero-overview">{movie.overview}</p>
          <div className="hero-buttons">
            <button className="hero-btn play-btn" onClick={handlePlay}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play
            </button>
            <button
              className="hero-btn info-btn"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="12" y1="11" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* ── Trailer Modal ── */}
      {showTrailer && trailerKey && (
        <div
          className="trailer-modal-overlay"
          onClick={() => setShowTrailer(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Movie Trailer"
        >
          <div
            className="trailer-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="trailer-close-btn"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              ✕
            </button>
            <div className="trailer-iframe-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Movie Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Hero;
