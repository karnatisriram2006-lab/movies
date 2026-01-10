import "./css/App.css";

import Home from "./pages/home";
import Favourite from "./pages/favourites";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import { MovieProvider } from "./contexts/moviecontext";
function App() {
  return (
    <MovieProvider>
      <Navbar />
      <main className="main-content">
        <div className="main-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favourite" element={<Favourite />} />
          </Routes>
        </div>
      </main>
    </MovieProvider>
  );
}

export default App;
