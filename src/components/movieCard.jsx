import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/moviecontext";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const { isfavs, addtofavs, removefromfavs } = useMovieContext();
  const favorite = isfavs(movie.id);
  const navigate = useNavigate();

  function favouritebtn(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removefromfavs(movie.id);
    else addtofavs(movie);
  }

  const openDetail = () => {
    const mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");
    navigate(`/${mediaType}/${movie.id}`);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") openDetail();
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <div
      className="movie-card"
      role="button"
      aria-label={`Open ${movie.title || movie.name}`}
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="movie-poster" aria-hidden="true">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "/placeholder-poster.png"
          }
          alt={movie.title || movie.name}
          loading="lazy"
        />
      </div>
      <button
        className={`favorite-btn ${favorite ? "active" : ""}`}
        onClick={favouritebtn}
        aria-pressed={favorite}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          className={`heart-icon ${favorite ? "filled" : ""}`}
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill={favorite ? "currentColor" : "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      {rating && (
        <div className="movie-rating">
          ★ {rating}
        </div>
      )}
      <div className="movie-overlay">
      </div>
      <div className="movie-info">
        <h3>{movie.title || movie.name}</h3>
        <p>{movie.release_date ? movie.release_date.split("-")[0] : movie.first_air_date ? movie.first_air_date.split("-")[0] : "—"}</p>
      </div>
    </div>
  );
}
export default MovieCard;
