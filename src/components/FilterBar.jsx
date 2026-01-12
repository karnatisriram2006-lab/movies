import React from 'react';

const FilterBar = ({ filters, genres, onFilterChange, onClearFilters }) => {
  return (
    <div className="filters-bar">
      <div className="filter-item">
        <label>Genre</label>
        <select
          value={filters.genre}
          onChange={(e) => onFilterChange("genre", e.target.value)}
        >
          <option value="">All</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label>Year</label>
        <input
          type="number"
          value={filters.year}
          placeholder="e.g. 2023"
          onChange={(e) => onFilterChange("year", e.target.value)}
        />
      </div>

      <div className="filter-item">
        <label>Min Rating</label>
        <select
          value={filters.min_rating}
          onChange={(e) => onFilterChange("min_rating", e.target.value)}
        >
          <option value="">Any</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-item">
        <label>Sort</label>
        <select
          value={filters.sort_by}
          onChange={(e) => onFilterChange("sort_by", e.target.value)}
        >
          <option value="popularity.desc">Popularity (desc)</option>
          <option value="popularity.asc">Popularity (asc)</option>
          <option value="primary_release_date.desc">
            Release Date (new → old)
          </option>
          <option value="primary_release_date.asc">
            Release Date (old → new)
          </option>
          <option value="vote_average.desc">Rating (high → low)</option>
          <option value="vote_average.asc">Rating (low → high)</option>
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn" onClick={onClearFilters}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
