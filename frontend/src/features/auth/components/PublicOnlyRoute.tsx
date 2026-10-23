import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../authContextValue";
import { showErrorAlert } from "../../../shared/utils/alerts";

function PublicOnlyRoute() {
  const { user, isLoading, errorMessage } = useAuth();

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
  if (user) {
    return <Navigate to={user.role === "EMPLOYER" ? "/employer/jobs" : "/jobs"} replace />;
  }
  return <Outlet />;
}

export default PublicOnlyRoute;
