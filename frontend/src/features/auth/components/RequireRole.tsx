import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../authContextValue";
import type { UserRole } from "../types/userRole";
import { showErrorAlert } from "../../../shared/utils/alerts";

function RequireRole({ role }: { role: UserRole }) {
  const { user, isLoading, errorMessage } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (errorMessage) {
      void showErrorAlert(errorMessage, "Session verification failed");
    }
  }, [errorMessage]);

  if (isLoading) {
    return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Checking your session...</p>;
  }
  if (errorMessage) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === "EMPLOYER" ? "/employer/jobs" : "/jobs"} replace />;
  }
  return <Outlet />;
}

export default RequireRole;
