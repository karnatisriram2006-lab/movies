import "../css/favourites.css";
// import { useContext } from "react";
import { useMovieContext } from "../contexts/moviecontext";
import MovieCard from "../components/movieCard";

export default function Favourite() {
  const { favorites } = useMovieContext();
  if (favorites && favorites.length > 0) {
    return (
        <div className="favorites">
            <h1>Your favorites</h1>
      <div className="home">
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      </div></div>
    );
  }
  return (
    <div className="favorites-empty">
      <h2>No movies added</h2>
      <p>Start adding movies to your favorites</p>
    </div>
  );
}
