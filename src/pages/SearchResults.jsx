import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import MovieCard from "../components/movieCard";
import { SkeletonCard } from "../components/SkeletonLoader";
import SEO from "../components/SEO";
import "../css/Home.css";
import { searchMovies, searchPerson } from "../services/api";

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    setMovies([]);
    setPeople([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [q]);

  useEffect(() => {
    if (!q) {
      setMovies([]);
      setPeople([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        if (activeTab === "movies") {
          const data = await searchMovies(q, { page });
          const newMovies = data.results || [];
          setMovies(prev => page === 1 ? newMovies : [...prev, ...newMovies]);
          setHasMore(newMovies.length > 0 && data.page < data.total_pages);
        } else if (activeTab === "people") {
          const data = await searchPerson(q, { page });
          setPeople(data.results || []);
          setHasMore(false);
        }
      } catch (e) {
        console.error("Search error:", e);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchResults();
  }, [q, page, activeTab]);

  const tabs = [
    { id: "movies", label: "Movies & TV" },
    { id: "people", label: "People" }
  ];

  return (
    <div className="home">
      <SEO title={`Search: ${q}`} description={`Search results for ${q}`} />
      <div className="search-header">
        <h2>Search results for "{q}"</h2>
        <div className="search-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`search-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
        
        {error ? (
          <div className="error-screen" style={{ height: "50vh" }}>
            <div className="error-content">
              <h2>Search Error</h2>
              <p>{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="movies-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : activeTab === "movies" ? (
          movies.length > 0 ? (
            <>
              <div className="movies-grid">
                {movies.map((m, index) => {
                  if (movies.length === index + 1) {
                    return (
                      <div ref={lastMovieElementRef} key={m.id}>
                        <MovieCard movie={m} />
                      </div>
                    );
                  } else {
                    return <MovieCard movie={m} key={m.id} />;
                  }
                })}
              </div>
              {loadingMore && (
                <div className="movies-grid" style={{ marginTop: "20px" }}>
                   {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={`more-${i}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "var(--muted)" }}>
               <p>No movies or TV shows found for "{q}". Try a different search term.</p>
            </div>
          )
        ) : (
          people.length > 0 ? (
            <div className="people-grid">
              {people.map((person) => (
                <Link to={`/person/${person.id}`} key={person.id} className="person-card">
                  <div className="person-avatar">
                    {person.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} />
                    ) : (
                      <div className="no-avatar">👤</div>
                    )}
                  </div>
                  <div className="person-details">
                    <h3>{person.name}</h3>
                    <p>{person.known_for_department}</p>
                    <div className="known-for">
                      {(person.known_for || []).slice(0, 3).map((item, i) => (
                        <span key={i} className="known-item">
                          {item.title || item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results" style={{ textAlign: "center", padding: "50px", color: "var(--muted)" }}>
               <p>No people found for "{q}". Try a different search term.</p>
            </div>
          )
        )}
    </div>
  );
}
