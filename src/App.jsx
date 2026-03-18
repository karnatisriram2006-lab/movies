import "./css/App.css";
import "./css/index.css";
import Home from "./pages/home";
import Favorite from "./pages/favorites";
import MovieDetail from "./pages/MovieDetail";
import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import { MovieProvider } from "./contexts/moviecontext";
import LiveRegion from "./components/LiveRegion";

function App() {
  return (
    <MovieProvider>
      <div className="app-container">
        <LiveRegion />
        <Navbar />
        <main className="main-content">
          <div className="main-wrapper">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/favorites" element={<Favorite />} />
            </Routes>
          </div>
        </main>
      </div>
    </MovieProvider>
  );
}

export default App;
