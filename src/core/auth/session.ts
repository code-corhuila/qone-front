// The session of the container: the only place that holds the token (norm 5.4.1, 5.5).
// The token is an RS256 JWT issued by qone-identity-api (or by dev-token.sh on develop);
// the client reads its claims for display and expiry only - every service validates the
// signature itself (5.3.7). Persisted in localStorage so a reload keeps the session.

export type Role = "STUDENT" | "PROFESSOR" | "ADMIN" | "SERVICE";

export interface Claims {
  sub: string;
  role: Role;
  name: string;
  exp: number;
}

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
}

export type SignInResult = { ok: true } | { ok: false; reason: "malformed" | "expired" };

const STORAGE_KEY = "qampus.session";
const ROLES: readonly Role[] = ["STUDENT", "PROFESSOR", "ADMIN", "SERVICE"];

function decodeBase64Url(part: string): string {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return decodeURIComponent(
    Array.from(atob(padded), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
  );
}

/** Reads the claims of a JWT without verifying it. `sub` and `exp` are required, as in every service. */
export function parseJwtClaims(token: string): Claims | undefined {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return undefined;
  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
    if (typeof payload["sub"] !== "string" || typeof payload["exp"] !== "number") return undefined;
    const role = ROLES.includes(payload["role"] as Role) ? (payload["role"] as Role) : "STUDENT";
    const name = typeof payload["name"] === "string" ? payload["name"] : "";
    return { sub: payload["sub"], role, name, exp: payload["exp"] };
  } catch {
    return undefined;
  }
}

type Listener = () => void;

let current: { token: string; claims: Claims } | undefined;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

function isExpired(claims: Claims): boolean {
  return claims.exp * 1000 <= Date.now();
}

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export const session = {
  /** Signs in with a token; rejects malformed or expired ones. */
  signIn(token: string): SignInResult {
    const claims = parseJwtClaims(token);
    if (!claims) return { ok: false, reason: "malformed" };
    if (isExpired(claims)) return { ok: false, reason: "expired" };
    current = { token, claims };
    storage()?.setItem(STORAGE_KEY, token);
    notify();
    return { ok: true };
  },

  /** Ends the session (sign out, or any 401 answered by the gateway or a service). */
  clear(): void {
    const had = current !== undefined;
    current = undefined;
    storage()?.removeItem(STORAGE_KEY);
    if (had) notify();
  },

  /** Loads the persisted token at boot; an expired one is discarded. */
  restore(): void {
    const token = storage()?.getItem(STORAGE_KEY);
    if (!token) return;
    const claims = parseJwtClaims(token);
    if (!claims || isExpired(claims)) {
      storage()?.removeItem(STORAGE_KEY);
      current = undefined;
      return;
    }
    current = { token, claims };
  },

  isAuthenticated(): boolean {
    return current !== undefined && !isExpired(current.claims);
  },

  token(): string | undefined {
    return this.isAuthenticated() ? current?.token : undefined;
  },

  user(): SessionUser | undefined {
    if (!this.isAuthenticated() || !current) return undefined;
    return { id: current.claims.sub, role: current.claims.role, name: current.claims.name };
  },

  /** Notifies on every sign-in and sign-out; returns the unsubscribe function. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
