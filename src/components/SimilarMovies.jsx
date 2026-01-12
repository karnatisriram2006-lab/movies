import React from 'react';
import MovieCard from './movieCard';

const SimilarMovies = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="detail-similar">
      <h3>Similar Movies</h3>
      <div className="movies-grid similar-grid">
        {movies.slice(0, 8).map((m) => (
          <MovieCard movie={m} key={m.id} />
        ))}
      </div>
    </section>
  );
};

export default SimilarMovies;
