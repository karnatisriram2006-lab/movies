import { useState, useEffect } from "react";
import MovieCard from "../components/movieCard";
import "../css/Home.css";
import { searchMovies, getPopularMoives } from "../services/api";

function Home() {
  const [searchmovie, setsearchmovie] = useState("");
  const [movies, setmovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMoives();
        setmovies(popularMovies);
      } catch (err) {
        console.log(err);
        setError("failed to load movies...");
      } finally {
        setloading(false);
      }
    };
    loadPopularMovies();
  }, []);

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!searchmovie.trim()) return;
    if (loading) return;
    setloading(true);
    try {
      const searchresult = await searchMovies(searchmovie);
      setmovies(searchresult);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("failed to load movies...");
    } finally {
      setloading(false);
    }
  };
  return (
    <>
      <form onSubmit={handlesubmit}>
        <div className="search-form">
          <input
            type="text"
            placeholder="Search for movies....."
            value={searchmovie}
            className="search-input"
            onChange={(e) => {
              setsearchmovie(e.target.value);
            }}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="home">
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
