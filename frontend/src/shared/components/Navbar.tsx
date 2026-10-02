import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/authContextValue";

function Navbar() {
  const navigate = useNavigate();
  useLocation();
  const { user, logout } = useAuth();
  const role = user?.role;
  const displayName = user?.displayName;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const profilePath =
    role === "EMPLOYEE"
      ? "/employee/profile"
      : role === "EMPLOYER"
      ? "/employer/profile"
      : "/";

  return (
    <header className="sticky top-0 z-10 flex min-h-[76px] w-full items-center justify-between border-b border-slate-400/20 bg-slate-950/75 px-8 backdrop-blur-[18px] max-sm:h-auto max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:p-4">
      <NavLink to="/" className="flex items-center gap-3">
        <div className="flex size-[42px] items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 text-[22px] font-black text-white shadow-[0_12px_30px_rgb(37_99_235/35%)]">H</div>
        <span className="text-[22px] font-black tracking-[-.04em] text-white">HireFlow</span>
      </NavLink>

      <nav className="flex items-center gap-2.5 max-sm:w-full max-sm:flex-wrap max-sm:justify-start">
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            isActive ? "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white bg-slate-400/15 text-white" : "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white"
          }
        >
          Browse jobs
        </NavLink>

        {role ? (
          <>
            {role === "EMPLOYER" && (
              <NavLink
                to="/employer/jobs"
                className={({ isActive }) =>
                  isActive ? "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white bg-slate-400/15 text-white" : "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white"
                }
              >
                My jobs
              </NavLink>
            )}
            {role === "EMPLOYEE" && (
              <NavLink
                to="/employee/applications"
                className={({ isActive }) =>
                  isActive ? "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white bg-slate-400/15 text-white" : "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white"
                }
              >
                Applications
              </NavLink>
            )}
            <NavLink
              to={profilePath}
              className={({ isActive }) =>
                isActive ? "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white bg-slate-400/15 text-white" : "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white"
              }
            >
              Profile
            </NavLink>

            <span className="text-sm font-bold text-slate-300">{displayName}</span>

            <button type="button" className="cursor-pointer rounded-full bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-blue-700" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white bg-slate-400/15 text-white" : "rounded-full px-3.5 py-2.5 text-sm font-extrabold text-slate-400 transition duration-200 hover:bg-slate-400/15 hover:text-white"
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "cursor-pointer rounded-full bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-blue-700 bg-linear-to-br from-blue-600 to-teal-500 shadow-[0_12px_30px_rgb(37_99_235/35%)]" : "cursor-pointer rounded-full bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-blue-700"
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