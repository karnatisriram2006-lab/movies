import React from 'react';
import MovieCard from './movieCard';

const MovieGrid = ({ movies, loading }) => {
  if (loading) {
    return (
      <div className="home">
        <div className="movies-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="movie-card skeleton" key={`skeleton-${i}`}>
              <div className="movie-poster">
                <div className="skeleton-poster" />
              </div>
              <div className="movie-info">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;
