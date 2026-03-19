/* eslint-disable react-refresh/only-export-components */
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
    try {
      const storedfavs = localStorage.getItem("favorites");
      if (storedfavs) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setfavorites(JSON.parse(storedfavs));
      }
    } catch (e) {
      console.warn("localStorage access denied for getting favorites:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (e) {
      console.warn("localStorage access denied for saving favorites:", e);
    }
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
