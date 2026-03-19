import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MovieCard from "../components/movieCard";
import "../css/Home.css";
import "../css/MovieDetail.css";
import { getPersonDetails, getMovieImageUrl } from "../services/api";

function PersonPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerson = async () => {
      setLoading(true);
      try {
        const data = await getPersonDetails(id);
        setPerson(data);
      } catch (err) {
        console.error("Person load error:", err);
        setError("Failed to load person details.");
      } finally {
        setLoading(false);
      }
    };
    loadPerson();
  }, [id]);

  if (loading) return (
    <div className="home-netflix loading">
      <div className="person-loading">
        <div className="person-poster-skeleton"></div>
        <div className="person-info-skeleton">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    </div>
  );

  if (error || !person) return (
    <div className="error-screen">
      <div className="error-content">
        <h2>Person Not Found</h2>
        <p>{error || "This person could not be found."}</p>
        <Link to="/" className="retry-btn">Go Home</Link>
      </div>
    </div>
  );

  const movieCredits = person.movie_credits?.cast || [];
  const tvCredits = person.tv_credits?.cast || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="home-netflix person-page">
      <div className="person-header">
        <div className="person-poster">
          <img
            src={person.profile_path ? getMovieImageUrl(person.profile_path, "w500") : "/placeholder-poster.png"}
            alt={person.name}
          />
        </div>
        <div className="person-info">
          <h1>{person.name}</h1>
          <p className="person-meta">
            {person.birthday && <span>Born: {formatDate(person.birthday)}</span>}
            {person.deathday && <span>Died: {formatDate(person.deathday)}</span>}
            {person.place_of_birth && <span>From: {person.place_of_birth}</span>}
          </p>
          {person.biography && (
            <div className="person-bio">
              <h3>Biography</h3>
              <p>{person.biography}</p>
            </div>
          )}
        </div>
      </div>

      {movieCredits.length > 0 && (
        <div className="person-credits">
          <h2>Movies ({movieCredits.length})</h2>
          <div className="movies-grid">
            {movieCredits.slice(0, 20).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {tvCredits.length > 0 && (
        <div className="person-credits">
          <h2>TV Shows ({tvCredits.length})</h2>
          <div className="movies-grid">
            {tvCredits.slice(0, 20).map((show) => (
              <MovieCard key={show.id} movie={{...show, title: show.name, release_date: show.first_air_date}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonPage;
