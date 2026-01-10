import {
  createContext,
  useState,
  useEffect,
  useContext
} from "react";
const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);
export const MovieProvider = ({ children }) => {
  const [favorites, setfavorites] = useState([]);
  useEffect(() => {
    const storedfavs = localStorage.getItem("favorites");
    if (storedfavs) setfavorites(JSON.parse(storedfavs));
  }, []);
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
  const addtofavs = (movie) => {
    setfavorites((prev) => [...prev, movie]);
  };
  const removefromfavs = (movieId) => {
    setfavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };
  const isfavs=(movieId)=>{
    return favorites.some(movie=>movie.id===movieId);
  }
  const value={
    favorites,
    addtofavs,
    removefromfavs,
    isfavs
  }
  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
