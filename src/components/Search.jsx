import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMulti, searchPerson } from "../services/api";
import useDebounce from "../hooks/useDebounce";
import "../css/Search.css";

export default function Search({
  placeholder = "Search movies, TV shows, people...",
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const [multiData, personData] = await Promise.all([
            searchMulti(debouncedQuery, { page: 1 }),
            searchPerson(debouncedQuery, { page: 1 })
          ]);
          
          const movies = (multiData.results || [])
            .filter(r => r.media_type === "movie" || r.media_type === "tv")
            .slice(0, 4);
          
          const people = (personData.results || [])
            .filter(p => p.known_for_department === "Acting" || p.known_for_department === "Directing")
            .slice(0, 2)
            .map(p => ({ ...p, media_type: "person" }));
          
          setSuggestions([...movies, ...people]);
          if (window.announce)
            window.announce(`${movies.length + people.length} suggestions for ${debouncedQuery}`);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const open = (item) => {
    setQuery("");
    setSuggestions([]);
    if (item.media_type === "person") {
      navigate(`/person/${item.id}`);
    } else {
      navigate(`/${item.media_type || "movie"}/${item.id}`);
    }
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
      const items = listRef.current?.querySelectorAll("li");
      const idx = Math.min(activeIndex + 1, suggestions.length - 1);
      items?.[idx]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      const items = listRef.current?.querySelectorAll("li");
      const idx = Math.max(activeIndex - 1, 0);
      items?.[idx]?.scrollIntoView({ block: "nearest" });
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
              {s.media_type === "person" ? (
                <div className="person-suggest">
                  <div className="suggest-avatar">
                    {s.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${s.profile_path}`} alt={s.name} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="suggest-meta">
                    <div className="suggest-title">{s.name}</div>
                    <div className="suggest-sub">Person</div>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={
                      s.poster_path || s.profile_path
                        ? `https://image.tmdb.org/t/p/w92${s.poster_path || s.profile_path}`
                        : ""
                    }
                    alt={`Poster for ${s.title || s.name}`}
                  />
                  <div className="suggest-meta">
                    <div className="suggest-title">{s.title || s.name}</div>
                    <div className="suggest-sub">
                      {s.release_date || s.first_air_date || ""} 
                      {s.media_type && <span className="media-type-badge">{s.media_type}</span>}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
