import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import MovieCard from "../components/movieCard";
import { useMovieContext } from "../contexts/moviecontext";
import "../css/MovieDetail.css";

const minutesToHours = (m) => {
  if (!m && m !== 0) return "—";
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${h}h ${mins}m`;
};

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const { isfavs, addtofavs, removefromfavs } = useMovieContext();
  const modalCloseRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getMovieDetails(id);
        if (mounted) setMovie(data);
      } catch (e) {
        console.error("movie details error", e);
        if (mounted) setError("Failed to load movie details.");
      } finally {
        if (mounted) setLoading(false);
      }

      // fetch providers separately; don't block main details
      try {
        const prov = await api.getMovieWatchProviders(id);
        if (mounted) setProviders(prov || null);
      } catch (e) {
        console.warn("Failed to load watch providers", e);
        if (mounted) setProviders(null);
      }
    };
    load();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (showTrailer && modalCloseRef.current) {
      modalCloseRef.current.focus();
    }
  }, [showTrailer]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showTrailer) setShowTrailer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showTrailer]);

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="detail-hero skeleton-hero">
          <div className="skeleton-poster" />
          <div className="skeleton-meta">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="error-message" role="alert">
        {error}
      </div>
    );

  if (!movie) return null;

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder-poster.png";

  const videos = movie.videos?.results || [];
  let trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  
  if (!trailer) {
    // Fallback: look for Teasers, then anything from YouTube
    trailer = videos.find((v) => v.type === "Teaser" && v.site === "YouTube") || 
              videos.find((v) => v.site === "YouTube");
  }
  const fav = isfavs(movie.id);

  return (
    <div className="movie-detail-immersive">
      {/* Background Layer: Trailer or Backdrop */}
      <div className="immersive-backdrop">
        {trailer && showTrailer ? (
          <div className="trailer-background">
            <iframe
              title="Trailer"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&rel=0`}
              allow="autoplay"
            />
            <div className="trailer-vignette" />
          </div>
        ) : (
          <div 
            className="backdrop-image" 
            style={{ backgroundImage: `url(${backdrop})` }}
          >
            <div className="backdrop-overlay" />
          </div>
        )}
      </div>

      <div className="immersive-content container">
        <div className="header-section">
          <div className="poster-container">
            <img src={poster} alt={movie.title} className="floating-poster" />
            <div className="poster-actions">
               <button
                className={`fav-action ${fav ? "active" : ""}`}
                onClick={() => fav ? removefromfavs(movie.id) : addtofavs(movie)}
              >
                {fav ? "❤️ In Favorites" : "🤍 Add to List"}
              </button>
            </div>
          </div>

          <div className="meta-container">
            <h1 className="movie-title-large">{movie.title}</h1>
            <p className="tagline-shine">{movie.tagline}</p>
            
            <div className="genres-container">
              {(movie.genres || []).map((g) => (
                <span key={g.id} className="immersive-genre-pill">
                  {g.name}
                </span>
              ))}
            </div>
            
            <div className="info-cards">
              <div className="info-card">
                <span className="label">Release</span>
                <span className="value">{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="info-card">
                <span className="label">Runtime</span>
                <span className="value">{minutesToHours(movie.runtime)}</span>
              </div>
              <div className="info-card">
                <span className="label">Rating</span>
                <span className="value">⭐ {movie.vote_average?.toFixed(1)}</span>
              </div>
              <div className="info-card">
                <span className="label">Status</span>
                <span className="value">{movie.status}</span>
              </div>
            </div>

            <p className="immersive-overview">{movie.overview}</p>

            <div className="primary-actions">
              {trailer && (
                <button
                  className="action-btn premiere-btn"
                  onClick={() => setShowTrailer(!showTrailer)}
                >
                  {showTrailer ? "🛑 Stop Trailer" : "🎥 Play Trailer"}
                </button>
              )}
              {movie.homepage && (
                <a 
                  href={movie.homepage} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="action-btn secondary-btn"
                >
                  Official Site
                </a>
              )}
            </div>

            {providers && (
              <div className="immersive-ott">
                <span className="ott-label">Watch on:</span>
                <div className="ott-icons">
                  {(() => {
                    const results = providers.results || {};
                    const region = results["US"] || results[Object.keys(results)[0]];
                    if (!region) return <span className="no-ott">Theater Only</span>;
                    const list = region.flatrate || region.buy || region.rent || [];
                    return list.slice(0, 4).map((p) => (
                      <img 
                        key={p.provider_id}
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} 
                        alt={p.provider_name}
                        title={p.provider_name}
                        className="ott-logo-small"
                      />
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="immersive-section">
          <h3 className="section-title">The Cast</h3>
          <div className="cast-carousel">
            {(movie.credits?.cast || []).slice(0, 12).map((c) => (
              <div key={c.id} className="cast-card">
                <div className="cast-img-wrapper">
                  <img
                    src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "/avatar.png"}
                    alt={c.name}
                  />
                </div>
                <div className="cast-info">
                  <span className="c-name">{c.name}</span>
                  <span className="c-role">{c.character}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="immersive-section">
          <h3 className="section-title">Similar Experience</h3>
          <div className="similar-carousel">
            {(movie.similar?.results || []).slice(0, 10).map((m) => (
              <div key={m.id} className="similar-card-wrapper">
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        </section>

        {showTrailer && trailer && (
          <div className="trailer-modal" role="dialog" aria-modal="true">
            <button
              ref={modalCloseRef}
              className="modal-close-btn"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Remove
            </button>
            <div className="trailer-inner">
              <iframe
                title="Trailer"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="trailer-iframe"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
