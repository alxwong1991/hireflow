import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setDisplayName(localStorage.getItem("displayName"));
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("displayName");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeProfileId");
    localStorage.removeItem("employerProfileId");

    setRole(null);
    setDisplayName(null);

    navigate("/");
  }

  const profilePath =
    role === "EMPLOYEE"
      ? "/employee/profile"
      : role === "EMPLOYER"
      ? "/employer/profile"
      : "/";

  return (
    <header className="navbar">
      <NavLink to="/" className="brand-link">
        <div className="brand-logo">H</div>
        <span className="brand-name">HireFlow</span>
      </NavLink>

      <nav className="nav-links">
        {role ? (
          <>
            <NavLink
              to={profilePath}
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              Profile
            </NavLink>

            <span className="nav-user-name">{displayName}</span>

            <button type="button" className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;