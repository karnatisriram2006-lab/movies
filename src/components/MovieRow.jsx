import React from "react";
import MovieCard from "./movieCard";
import "../css/MovieRow.css";

function MovieRow({ title, movies }) {
  return (
    <div className="movie-row">
      <h2 className="movie-row-title">{title}</h2>
      <div className="movie-row-posters">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-row-card">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieRow;
