import "./css/App.css";

import Home from "./pages/home";
import Favourite from "./pages/favourites";
import MovieDetail from "./pages/MovieDetail";
import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import { MovieProvider } from "./contexts/moviecontext";
import LiveRegion from "./components/LiveRegion";
function App() {
  return (
    <MovieProvider>
      <LiveRegion />
      <Navbar />
      <main className="main-content">
        <div className="main-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/favourite" element={<Favourite />} />
          </Routes>
        </div>
      </main>
    </MovieProvider>
  );
}

export default App;
