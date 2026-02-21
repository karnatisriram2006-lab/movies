import React from "react";
import "../css/Hero.css";

function Hero({ movie }) {
  if (!movie) return null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  return (
    <div
      className="hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(20,20,20,1) 100%), url(${backdropUrl})`,
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{movie.title || movie.name}</h1>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-buttons">
          <button className="hero-btn play-btn">Play</button>
          <button className="hero-btn info-btn">More Info</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
