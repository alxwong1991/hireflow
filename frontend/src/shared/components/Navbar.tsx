import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand-link">
        <div className="brand-logo">H</div>
        <span className="brand-name">HireFlow</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            isActive ? "nav-button active-nav-button" : "nav-button"
          }
        >
          Register
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;