import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/moviecontext";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const { isfavs, addtofavs, removefromfavs } = useMovieContext();
  const favorite = isfavs(movie.id);

  function favouritebtn(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removefromfavs(movie.id);
    else addtofavs(movie);
  }

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const title = movie.title || movie.name || "Untitled";
  const year = movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0];
  const mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");

  return (
    <article className="movie-card">
      <Link className="movie-card-link" to={`/${mediaType}/${movie.id}`} aria-label={`Open ${title}${year ? `, ${year}` : ""}${rating ? `, rated ${rating} out of 10` : ""}`}>
        <div className="movie-poster">
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder-poster.png"}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        {rating && <div className="movie-rating" aria-hidden="true">★ {rating}</div>}
        <div className="movie-overlay" aria-hidden="true" />
        <div className="movie-info">
          <h3>{title}</h3>
          <p>{year || "Release date unavailable"}</p>
        </div>
      </Link>
      <button
        className={`favorite-btn ${favorite ? "active" : ""}`}
        onClick={favouritebtn}
        aria-pressed={favorite}
        aria-label={`${favorite ? "Remove" : "Add"} ${title} ${favorite ? "from" : "to"} favorites`}
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
    </article>
  );
}
export default MovieCard;
