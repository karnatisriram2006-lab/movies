import "./css/App.css";
import "./css/index.css";
import Home from "./pages/home";
import Favourite from "./pages/favourites";
import MovieDetail from "./pages/MovieDetail";
import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/Footer"; // Import Footer
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
              <Route path="/favourite" element={<Favourite />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </MovieProvider>
  );
}

export default App;
