export const DEFAULT_MOVIE_SORT = "popularity.desc";

export function readMovieFilters(searchParams) {
  return {
    genre: searchParams.get("genre") || "",
    sortBy: searchParams.get("sort") || DEFAULT_MOVIE_SORT,
    year: searchParams.get("year") || "",
    minRating: searchParams.get("rating") || "",
    language: searchParams.get("language") || "",
  };
}

export function toDiscoverFilters(filters) {
  return {
    genre: filters.genre || undefined,
    sort_by: filters.sortBy || DEFAULT_MOVIE_SORT,
    year: filters.year || undefined,
    min_rating: filters.minRating || undefined,
    language: filters.language || undefined,
  };
}

export function updateMovieFilterParams(currentParams, filters) {
  const nextParams = new URLSearchParams(currentParams);
  const values = {
    genre: filters.genre,
    sort: filters.sortBy === DEFAULT_MOVIE_SORT ? "" : filters.sortBy,
    year: filters.year,
    rating: filters.minRating,
    language: filters.language,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
  });

  return nextParams;
}

export function hasMovieFilters(filters) {
  return Boolean(
    filters.genre || filters.year || filters.minRating || filters.language ||
    filters.sortBy !== DEFAULT_MOVIE_SORT
  );
}
