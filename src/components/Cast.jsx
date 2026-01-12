import React from 'react';

const Cast = ({ cast }) => {
  if (!cast || cast.length === 0) {
    return null;
  }

  return (
    <section className="detail-cast">
      <h3>Top Cast</h3>
      <div className="cast-grid">
        {cast.slice(0, 8).map((c) => (
          <div key={c.cast_id || c.credit_id} className="cast-item">
            <img
              src={
                c.profile_path
                  ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                  : '/avatar.png'
              }
              alt={c.name}
              loading="lazy"
            />
            <div className="cast-meta">
              <div className="cast-name">{c.name}</div>
              <div className="cast-role">{c.character}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Cast;
