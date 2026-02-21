import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../css/Navbar.css";
import Search from "./Search";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
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
          <Link to="/" onClick={() => setOpen(false)}>MOVIES</Link>
        </div>
        <div id="navbar-links" className={`navbar-links ${open ? "open" : ""}`}>
          <Link className="nav-link" to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link className="nav-link" to="/" onClick={() => setOpen(false)}>
            TV Shows
          </Link>
          <Link className="nav-link" to="/" onClick={() => setOpen(false)}>
            Movies
          </Link>
          <Link className="nav-link" to="/" onClick={() => setOpen(false)}>
            New & Popular
          </Link>
          <Link className="nav-link" to="/favourite" onClick={() => setOpen(false)}>
            My List
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        <div className="search-container">
          <Search />
        </div>
        <div className="profile-icon">
          <div className="profile-avatar"></div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
