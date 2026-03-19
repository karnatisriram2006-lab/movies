import { Link, NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../css/Navbar.css";
import Search from "./Search";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""}`}>
        <div className="navbar-left">
          <button
            className={`hamburger ${open ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className="navbar-brand">
            <Link to="/" onClick={closeMenu}>MOVIES</Link>
          </div>
          
          <div className={`navbar-links ${open ? "open" : ""}`}>
            <NavLink className="nav-link" to="/" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink className="nav-link" to="/tv" onClick={closeMenu}>
              TV Shows
            </NavLink>
            <NavLink className="nav-link" to="/movies" onClick={closeMenu}>
              Movies
            </NavLink>
            <NavLink className="nav-link" to="/latest" onClick={closeMenu}>
              New & Popular
            </NavLink>
            <NavLink className="nav-link" to="/favorites" onClick={closeMenu}>
              My List
            </NavLink>
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
      
      {open && <div className="nav-backdrop" onClick={closeMenu}></div>}
    </>
  );
}

export default Navbar;
