import "../css/favourites.css";
import { useMovieContext } from "../contexts/moviecontext";
import MovieCard from "../components/movieCard";

export default function Favourite() {
  const { favorites } = useMovieContext();
  
  if (favorites && favorites.length > 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>My List</h1>
        </div>
        <div className="favorites-grid">
          {favorites.map((movie) => (
            <div key={movie.id} className="favorite-item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="favorites-empty">
      <div className="empty-content">
        <h2 className="empty-title">Your list is empty.</h2>
        <p className="empty-subtitle">Add shows and movies to your list to watch them later.</p>
        <button 
          className="empty-btn" 
          onClick={() => window.location.href = '/'}
        >
          Explore Movies
        </button>
      </div>
    </div>
  );
}
