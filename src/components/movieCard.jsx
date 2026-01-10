import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/moviecontext";
function MovieCard({ movie }) {
  const { isfavs, addtofavs, removefromfavs } = useMovieContext();
  const favorite = isfavs(movie.id);
  function favouritebtn(e) {
    e.preventDefault();
    if (favorite) removefromfavs(movie.id);
    else addtofavs(movie);
  }
  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="movie-overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={favouritebtn}
            aria-pressed={favorite}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className="heart"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date.split("-")[0]}</p>
      </div>
    </div>
  );
}
export default MovieCard;
