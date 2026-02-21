import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Search.css";

export default function Search({
  placeholder = "Search movies, e.g. Inception",
  max = 6,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await api.autoSuggest(query, max);
        setSuggestions(items);
        if (window.announce)
          window.announce(`${items.length} suggestions for ${query}`);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const open = (movie) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/movie/${movie.id}`);
  };

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    if (window.announce) window.announce(`Searching for ${query}`);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSuggestions([]);
  };

  const onKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      listRef.current
        ?.querySelectorAll("li")
        [Math.min(activeIndex + 1, suggestions.length - 1)]?.scrollIntoView({
          block: "nearest",
        });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      listRef.current
        ?.querySelectorAll("li")
        [Math.max(activeIndex - 1, 0)]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        open(suggestions[activeIndex]);
      } else {
        submit(e);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleSearch = (e) => {
    e.preventDefault();
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!query.trim()) {
      setIsExpanded(false);
    } else {
      submit(e);
    }
  };

  const handleBlur = () => {
    if (!query.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`search-wrapper ${isExpanded ? "expanded" : ""}`}>
      <form
        className="search-form"
        onSubmit={submit}
        role="search"
        aria-label="Site search"
      >
        <button 
          className="search-btn" 
          type={isExpanded && query.trim() ? "submit" : "button"} 
          aria-label="Search"
          onClick={toggleSearch}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
        <input
          ref={inputRef}
          className={`search-input ${isExpanded ? "active" : ""}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="search-suggestions"
          tabIndex={isExpanded ? 0 : -1}
        />
      </form>


      {loading && <div className="search-loading">Searching…</div>}

      {suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="suggestions"
          role="listbox"
          ref={listRef}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id}
              role="option"
              aria-selected={activeIndex === idx}
              className={activeIndex === idx ? "active" : ""}
              onMouseDown={() => open(s)}
            >
              <img
                src={
                  s.poster_path
                    ? `https://image.tmdb.org/t/p/w92${s.poster_path}`
                    : ""
                }
                alt={`Poster for ${s.title}`}
              />
              <div className="suggest-meta">
                <div className="suggest-title">{s.title}</div>
                <div className="suggest-sub">{s.release_date}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
