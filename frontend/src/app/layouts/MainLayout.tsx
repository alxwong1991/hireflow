import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SESSION_ENDED_EVENT } from "../../features/auth/sessionMonitor";
import type { SessionEndReason } from "../../features/auth/sessionMonitor";
import { useAuth } from "../../features/auth/authContextValue";
import { showErrorAlert } from "../../shared/utils/alerts";

function MainLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [endedSession, setEndedSession] = useState<{ reason: SessionEndReason } | null>(null);
  const handledSession = useRef(endedSession);
  useEffect(() => {
    const onSessionEnded = (event: Event) => {
      setEndedSession({ reason: event instanceof CustomEvent && event.detail === "inactive" ? "inactive" : "expired" });
    };
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
  }, []);
  useEffect(() => {
    // Wait for auth state to clear so the public-only login route cannot bounce back.
    if (!endedSession || user || handledSession.current === endedSession) return;
    handledSession.current = endedSession;
    void navigate("/login", { replace: true });
    void showErrorAlert(
      endedSession.reason === "inactive"
        ? "You have been logged out after 30 minutes of inactivity. Please log in again."
        : "Your session has expired. Please log in again.",
      "Session ended",
    );
  }, [endedSession, navigate, user]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-8 max-sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;