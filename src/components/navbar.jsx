import { Link } from "react-router-dom";
import "../css/Navbar.css";
function Navbar() {
  return (
    <nav className="navbar container">
      <div className="navbar-brand">
        <Link to="/">Movie App</Link>
      </div>
      <div className="navbar-links">
        <Link className="nav-link" to="/">
          Home
        </Link>
        <Link className="nav-link" to="/favourite">
          Favourites
        </Link>
      </div>
    </nav>
  );
}
export default Navbar;
