const SESSION_KEY = "movie_session_id";

/**
 * Generate a unique session ID using crypto API
 */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create a session ID for anonymous users
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Check if user has a session ID
 */
export function hasSessionId(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_KEY) !== null;
}

/**
 * Clear session ID (after merge or user wants to reset)
 */
export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Generate a fingerprint based on browser characteristics
 * Used as fallback if localStorage is not available
 */
export function generateFingerprint(): string {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas?.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }

  const fingerprintData = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas?.toDataURL() || "",
  ].join("|");

  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}
