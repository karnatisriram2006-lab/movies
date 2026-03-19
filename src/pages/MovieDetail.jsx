import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getMovieImageUrl, getTVDetails } from "../services/api";
import MovieCard from "../components/movieCard";
import { SkeletonHero } from "../components/SkeletonLoader";
import SEO from "../components/SEO";
import { useMovieContext } from "../contexts/moviecontext";
import "../css/MovieDetail.css";

const minutesToHours = (m) => {
  if (!m && m !== 0) return "—";
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${h}h ${mins}m`;
};

export default function MovieDetail({ mediaType = "movie" }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
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
      setError(null);
      try {
        const data = mediaType === "tv" 
          ? await getTVDetails(id)
          : await api.getMovieDetails(id);
        if (mounted) setItem(data);
      } catch (e) {
        console.error("details error", e);
        if (mounted) setError("Failed to load details. Please try again later.");
      } finally {
        if (mounted) setLoading(false);
      }

      if (mediaType === "movie") {
        try {
          const prov = await api.getMovieWatchProviders(id);
          if (mounted) setProviders(prov || null);
        } catch (e) {
          console.warn("Failed to load watch providers", e);
        }
      }
    };
    load();
    return () => (mounted = false);
  }, [id, mediaType]);

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
      <div className="movie-detail-immersive">
        <SkeletonHero />
      </div>
    );
  }

  if (error)
    return (
      <div className="error-screen" style={{ height: "100vh" }}>
        <div className="error-content">
          <h2>Navigation Error</h2>
          <p>{error}</p>
          <Link to="/" className="retry-btn" style={{ textDecoration: "none", display: "inline-block" }}>
            Back to Home
          </Link>
        </div>
      </div>
    );

  if (!item) return null;

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const runtime = item.runtime || item.episode_run_time?.[0];
  const overview = item.overview;
  const tagline = item.tagline;
  const status = item.status;
  const voteAverage = item.vote_average;

  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder-poster.png";

  const videos = item.videos?.results || [];
  let trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  
  if (!trailer) {
    trailer = videos.find((v) => v.type === "Teaser" && v.site === "YouTube") || 
              videos.find((v) => v.site === "YouTube");
  }
  const fav = isfavs(item.id);

  return (
    <div className="movie-detail-immersive">
      <SEO 
        title={title} 
        description={overview} 
        image={getMovieImageUrl(item.backdrop_path, "w1280")} 
      />
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
            <img src={poster} alt={title} className="floating-poster" />
            <div className="poster-actions">
               <button
                className={`fav-action ${fav ? "active" : ""}`}
                onClick={() => fav ? removefromfavs(item.id) : addtofavs(item)}
              >
                {fav ? "In Favorites" : "Add to List"}
              </button>
            </div>
          </div>

          <div className="meta-container">
            <h1 className="movie-title-large">{title}</h1>
            {tagline && <p className="tagline-shine">{tagline}</p>}
            
            <div className="genres-container">
              {(item.genres || []).map((g) => (
                <span key={g.id} className="immersive-genre-pill">
                  {g.name}
                </span>
              ))}
            </div>
            
            <div className="info-cards">
              {releaseDate && (
                <div className="info-card">
                  <span className="label">{mediaType === "tv" ? "First Air" : "Release"}</span>
                  <span className="value">{new Date(releaseDate).getFullYear()}</span>
                </div>
              )}
              {runtime && (
                <div className="info-card">
                  <span className="label">{mediaType === "tv" ? "Episode" : "Runtime"}</span>
                  <span className="value">{mediaType === "tv" ? `${runtime} min` : minutesToHours(runtime)}</span>
                </div>
              )}
              <div className="info-card">
                <span className="label">Rating</span>
                <span className="value">⭐ {voteAverage?.toFixed(1)}</span>
              </div>
              <div className="info-card">
                <span className="label">Status</span>
                <span className="value">{status}</span>
              </div>
              {mediaType === "tv" && item.number_of_seasons && (
                <div className="info-card">
                  <span className="label">Seasons</span>
                  <span className="value">{item.number_of_seasons}</span>
                </div>
              )}
              {mediaType === "tv" && item.number_of_episodes && (
                <div className="info-card">
                  <span className="label">Episodes</span>
                  <span className="value">{item.number_of_episodes}</span>
                </div>
              )}
            </div>

            <p className="immersive-overview">{overview}</p>

            <div className="primary-actions">
              {trailer && (
                <button
                  className="action-btn premiere-btn"
                  onClick={() => setShowTrailer(!showTrailer)}
                >
                  {showTrailer ? "Stop Trailer" : "Play Trailer"}
                </button>
              )}
              {item.homepage && (
                <a 
                  href={item.homepage} 
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
            {(item.credits?.cast || []).slice(0, 12).map((c) => (
              <Link to={`/person/${c.id}`} key={c.id} className="cast-card">
                <div className="cast-img-wrapper">
                  <img
                    src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "/avatar.png"}
                    alt={c.name}
                  />
                </div>
                <div className="cast-info">
                  <span className="c-name">{c.name}</span>
                  <span className="c-role">{c.character || c.roles?.[0]?.character}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="immersive-section">
          <h3 className="section-title">{mediaType === "tv" ? "Similar Shows" : "Similar Experience"}</h3>
          <div className="similar-carousel">
            {(item.similar?.results || []).slice(0, 10).map((m) => (
              <div key={m.id} className="similar-card-wrapper">
                <MovieCard movie={{...m, media_type: mediaType}} />
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
