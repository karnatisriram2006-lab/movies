import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import MovieCard from "../components/movieCard";
import { useMovieContext } from "../contexts/moviecontext";
import WatchProviders from "../components/WatchProviders";
import Cast from "../components/Cast";
import SimilarMovies from "../components/SimilarMovies";
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

  const trailer = (movie.videos?.results || []).find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const fav = isfavs(movie.id);

  return (
    <div className="movie-detail">
      <div
        className="detail-hero"
        style={
          backdrop
            ? {
                backgroundImage: `linear-gradient(rgba(6,8,10,0.7), rgba(6,8,10,0.6)), url(${backdrop})`,
              }
            : {}
        }
      >
        <div className="detail-inner">
          <div className="detail-poster">
            <img src={poster} alt={`${movie.title} poster`} loading="lazy" />
            <button
              className={`btn favorite-detail ${fav ? "active" : ""}`}
              onClick={() =>
                fav ? removefromfavs(movie.id) : addtofavs(movie)
              }
              aria-pressed={fav}
            >
              {fav ? "♥ Favorited" : "♡ Add to favorites"}
            </button>
          </div>

          <div className="detail-meta">
            <h1>{movie.title}</h1>
            <p className="tagline">{movie.tagline}</p>

            <div className="meta-row">
              <span className="meta-item">{movie.release_date}</span>
              <span className="meta-sep">•</span>
              <span className="meta-item">{minutesToHours(movie.runtime)}</span>
              <span className="meta-sep">•</span>
              <span className="meta-item">{movie.status}</span>
            </div>

            <div className="genres">
              {(movie.genres || []).map((g) => (
                <span key={g.id} className="genre-pill">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="overview">{movie.overview}</p>

            <WatchProviders providers={providers} />

            <div className="detail-actions">
              {trailer && (
                <button
                  className="btn primary"
                  onClick={() => setShowTrailer(true)}
                >
                  Watch Trailer
                </button>
              )}
              <a
                className="btn"
                href={movie.homepage || "#"}
                target="_blank"
                rel="noreferrer"
              >
                Official Site
              </a>
              <Link className="btn" to="/">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Cast cast={movie.credits?.cast} />
      <SimilarMovies movies={movie.similar?.results} />

      {showTrailer && trailer && (
        <div className="trailer-modal" role="dialog" aria-modal="true">
          <div className="trailer-inner">
            <button
              ref={modalCloseRef}
              className="modal-close"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              ✕
            </button>
            <iframe
              title="Trailer"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
