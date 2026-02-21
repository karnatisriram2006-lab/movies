import React from 'react';
import '../css/Footer.css';
import tmdbLogo from '../assets/tmdb_logo.svg'; // Assuming you will add the logo here

function Footer() {
  return (
    <footer className="app-footer">
      <div className="tmdb-attribution">
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
          <img src={tmdbLogo} alt="The Movie Database" className="tmdb-logo" />
        </a>
        <p>This application uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  );
}

export default Footer;
