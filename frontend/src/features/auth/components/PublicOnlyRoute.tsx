import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../authContextValue";

function PublicOnlyRoute() {
  const { user, isLoading, errorMessage } = useAuth();

  if (isLoading) {
    return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Checking your session...</p>;
  }
  if (errorMessage) {
    return <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage}</p>;
  }
  if (user) {
    return <Navigate to={user.role === "EMPLOYER" ? "/employer/jobs" : "/jobs"} replace />;
  }
  return <Outlet />;
}

export default PublicOnlyRoute;
