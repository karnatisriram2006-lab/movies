import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "../css/Navbar.css";
import Search from "./Search";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar container sticky">
      <div className="navbar-left">
        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-controls="navbar-links"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <div className="navbar-brand">
          <Link to="/">Movie App</Link>
        </div>
      </div>

      <div className="search-container">
        {/* Reusable Search component */}
        <Search />
      </div>

      <div id="navbar-links" className={`navbar-links ${open ? "open" : ""}`}>
        <Link className="nav-link" to="/">
          Home
        </Link>
        <Link className="nav-link" to="/movies">
          Movies
        </Link>
        <Link className="nav-link" to="/genres">
          Genres
        </Link>
        <Link className="nav-link" to="/top-rated">
          Top Rated
        </Link>
        <Link className="nav-link" to="/favourite">
          Favourites
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
