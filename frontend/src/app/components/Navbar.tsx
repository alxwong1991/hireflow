import { NavLink, useNavigate } from "react-router-dom";
import { Bell, BriefcaseBusiness, ClipboardList, LogIn, LogOut, MessageSquare, Search, UserRound, UserRoundPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../features/auth/authContextValue";
import { profilePathForRole } from "../../features/auth/authRoutes";
import { useNotifications } from "../../features/notifications/notificationQueries";
import {
  unreadBadgeText,
  unreadCountLabel,
} from "../../features/notifications/notificationUtils";

const itemClassName = "group flex min-w-0 flex-col items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1 py-2.5 text-[10px] font-semibold tracking-[-.02em] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:px-3 sm:text-xs lg:min-w-[88px]";

function navigationClassName({ isActive }: { isActive: boolean }) {
  return `${itemClassName} ${
    isActive
      ? "bg-sky-400/10 text-sky-300"
      : "text-slate-400 hover:bg-slate-400/10 hover:text-white"
  }`;
}

function NavigationItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink to={to} className={navigationClassName}>
      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const brand = (
    <>
      <div className="flex size-[42px] items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 text-[22px] font-black text-white shadow-[0_12px_30px_rgb(37_99_235/35%)]">H</div>
      <span className="text-[22px] font-black tracking-[-.04em] text-white">HireFlow</span>
    </>
  );

  return (
    <header className="sticky top-0 z-10 flex w-full flex-col gap-3 border-b border-slate-400/20 bg-slate-950/85 px-3 py-3 backdrop-blur-[18px] sm:px-8 lg:min-h-[88px] lg:flex-row lg:justify-between lg:gap-6 lg:py-2">
      <div className="flex min-w-0 items-center justify-between gap-5">
        {user ? (
          <div aria-label="HireFlow" className="flex shrink-0 select-none items-center gap-3">
            {brand}
          </div>
        ) : (
          <NavLink to="/" aria-label="HireFlow home" className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400">
            {brand}
          </NavLink>
        )}
        {user && (
          <span className="max-w-40 truncate text-sm font-semibold text-slate-300 lg:hidden" title={user.displayName}>
            {user.displayName}
          </span>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-5">
        {user && (
          <span className="hidden max-w-36 truncate text-sm font-semibold text-slate-300 lg:block" title={user.displayName}>
            {user.displayName}
          </span>
        )}
        <nav aria-label="Main navigation" className={`grid w-full items-stretch gap-1 lg:w-auto ${role ? "grid-cols-6" : "grid-cols-3"}`}>
          <NavigationItem to="/jobs" icon={Search} label="Browse jobs" />
          {role ? (
            <>
              {role === "EMPLOYER" && (
                <NavigationItem to="/employer/jobs" icon={BriefcaseBusiness} label="My jobs" />
              )}
              {role === "EMPLOYEE" && (
                <NavigationItem to="/employee/applications" icon={ClipboardList} label="Applications" />
              )}
              {user && <NotificationBell email={user.email} role={user.role} />}
              <NavigationItem to={`/${role.toLowerCase()}/messages`} icon={MessageSquare} label="Messages" />
              <NavigationItem to={profilePathForRole(role)} icon={UserRound} label="Profile" />
              <button
                type="button"
                className={`${itemClassName} cursor-pointer text-slate-400 hover:bg-red-400/10 hover:text-red-300`}
                onClick={handleLogout}
              >
                <LogOut size={22} strokeWidth={1.8} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavigationItem to="/login" icon={LogIn} label="Login" />
              <NavigationItem to="/register" icon={UserRoundPlus} label="Register" />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NotificationBell({
  email,
  role,
}: {
  email: string;
  role: NonNullable<ReturnType<typeof useAuth>["user"]>["role"];
}) {
  const { data, error } = useNotifications(email, role);
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const notificationsPath =
    role === "EMPLOYEE" ? "/employee/notifications" : "/employer/notifications";

  return (
    <NavLink
      to={notificationsPath}
      aria-label={
        error
          ? "Notifications. Unread count unavailable."
          : data?.pages.length
            ? unreadCountLabel(unreadCount)
            : "Notifications. Unread count loading."
      }
      title={error ? "Unable to load unread notifications" : `${unreadCount} unread notifications`}
      className={navigationClassName}
    >
      <span className="relative inline-flex">
        <Bell size={22} strokeWidth={1.8} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-2.5 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-slate-950"
            aria-hidden="true"
          >
            {unreadBadgeText(unreadCount)}
          </span>
        )}
      </span>
      <span>Notifications</span>
      {error && <span className="sr-only" role="status">Unread notification count unavailable.</span>}
    </NavLink>
  );
}

export default Navbar;
