const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

if (!API_KEY) {
    console.warn("VITE_TMDB_API_KEY is not set. API requests may fail.");
}

const buildUrl = (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", API_KEY);
    Object.keys(params).forEach((key) => {
        const val = params[key];
        if (val !== undefined && val !== null && val !== "") {
            url.searchParams.set(key, val);
        }
    });
    return url.toString();
};

const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed ${res.status} ${res.statusText} ${text}`);
    }
    return res.json();
};

export const getPopularMovies = async (page = 1) => {
    const url = buildUrl("/movie/popular", { page });
    const data = await fetchJson(url);
    return data;
};

export const getTopRatedMovies = async (page = 1) => {
    const url = buildUrl("/movie/top_rated", { page });
    return fetchJson(url);
};

export const searchMovies = async (query, options = {}) => {
    if (!query) return { results: [], total_pages: 0, page: 1 };
    const params = {
        query: encodeURIComponent(query),
        page: options.page || 1,
        include_adult: options.include_adult ? "true" : "false",
        language: options.language || undefined,
    };
    const url = buildUrl("/search/movie", params);
    return fetchJson(url);
};

export const discoverMovies = async (filters = {}) => {
    // filters: { with_genres, primary_release_year, 'vote_average.gte', with_original_language, sort_by, page }
    const params = {
        page: filters.page || 1,
        with_genres: filters.genre || filters.with_genres,
        primary_release_year: filters.year || undefined,
        "vote_average.gte": filters.min_rating || undefined,
        with_original_language: filters.language || undefined,
        sort_by: filters.sort_by || "popularity.desc",
    };
    const url = buildUrl("/discover/movie", params);
    return fetchJson(url);
};

export const getMovieDetails = async (movieId) => {
    const url = buildUrl(`/movie/${movieId}`, { append_to_response: "videos,credits,similar" });
    return fetchJson(url);
};

export const getMovieCredits = async (movieId) => {
    const url = buildUrl(`/movie/${movieId}/credits`);
    return fetchJson(url);
};

export const getMovieVideos = async (movieId) => {
    const url = buildUrl(`/movie/${movieId}/videos`);
    return fetchJson(url);
};

export const getMovieWatchProviders = async (movieId) => {
    const url = buildUrl(`/movie/${movieId}/watch/providers`);
    return fetchJson(url);
};

export const getGenres = async () => {
    const cacheKey = "tmdb_genres";
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }
    const url = buildUrl('/genre/movie/list');
    const data = await fetchJson(url);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
};

export const autoSuggest = async (query, limit = 5) => {
    if (!query || query.length < 2) return [];
    const data = await searchMovies(query, { page: 1 });
    return (data.results || []).slice(0, limit).map((m) => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
    }));
};

export default {
    getPopularMovies,
    getTopRatedMovies,
    searchMovies,
    discoverMovies,
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getGenres,
    autoSuggest,
    getMovieWatchProviders,
};