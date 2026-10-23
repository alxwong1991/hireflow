export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const RENEW_INTERVAL_MS = 60 * 1000;

export const SESSION_EXPIRED_EVENT = "hireflow:session-expired";
export const SESSION_ENDED_EVENT = "hireflow:session-ended";
export type SessionEndReason = "inactive" | "expired";

export interface SessionSnapshot {
  token: string;
  lastActivity: number;
}

export function tokenTimes(token: string): { issuedAt: number; expiresAt: number } {
  const payload: unknown = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  if (
    typeof payload !== "object" || payload === null ||
    !("iat" in payload) || typeof payload.iat !== "number" ||
    !("exp" in payload) || typeof payload.exp !== "number" ||
    !Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)
  ) {
    throw new Error("Invalid session token");
  }
  return { issuedAt: payload.iat * 1000, expiresAt: payload.exp * 1000 };
}

export function sessionEndReason(session: SessionSnapshot, now = Date.now()): SessionEndReason | null {
  if (!Number.isFinite(session.lastActivity) || now - session.lastActivity >= INACTIVITY_TIMEOUT_MS) {
    return "inactive";
  }
  try {
    return now >= tokenTimes(session.token).expiresAt ? "expired" : null;
  } catch {
    return "expired";
  }
}

interface MonitorOptions {
  activityTarget: EventTarget;
  visibilityTarget: EventTarget;
  readSession: () => SessionSnapshot | null;
  recordActivity: (now: number) => void;
  renew: (token: string) => Promise<void>;
  expire: (reason: SessionEndReason) => void;
  reportError: (error: unknown) => void;
}

export function startSessionMonitor(options: MonitorOptions): () => void {
  let renewing = false;
  let stopped = false;
  let lastAttempt = 0;
  let lastRecorded = 0;
  let reportedError = false;

  const check = () => {
    const session = options.readSession();
    if (!session) return false;
    const now = Date.now();
    const reason = sessionEndReason(session, now);
    if (reason) {
      options.expire(reason);
      return false;
    }
    const { issuedAt } = tokenTimes(session.token);
    if (
      !renewing && session.lastActivity > issuedAt &&
      now - issuedAt >= RENEW_INTERVAL_MS && now - lastAttempt >= RENEW_INTERVAL_MS
    ) {
      renewing = true;
      lastAttempt = now;
      void options.renew(session.token).then(() => {
        reportedError = false;
      }).catch((error: unknown) => {
        if (!stopped && options.readSession() && !reportedError) {
          reportedError = true;
          options.reportError(error);
        }
      }).finally(() => {
        renewing = false;
      });
    }
    return true;
  };

  const activity = () => {
    // Check the old deadline before recording input, including after sleep.
    if (!check()) return;
    const now = Date.now();
    if (now - lastRecorded >= 1000) {
      lastRecorded = now;
      options.recordActivity(now);
    }
  };
  const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"];
  events.forEach((event) => options.activityTarget.addEventListener(event, activity, { passive: true, capture: true }));
  options.visibilityTarget.addEventListener("visibilitychange", check);
  options.activityTarget.addEventListener("focus", check);
  options.activityTarget.addEventListener("pageshow", check);
  const interval = setInterval(check, 1000);
  check();

  return () => {
    stopped = true;
    clearInterval(interval);
    events.forEach((event) => options.activityTarget.removeEventListener(event, activity, true));
    options.visibilityTarget.removeEventListener("visibilitychange", check);
    options.activityTarget.removeEventListener("focus", check);
    options.activityTarget.removeEventListener("pageshow", check);
  };
}
