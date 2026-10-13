import { useSyncExternalStore } from "react";
import { session, type SessionUser } from "./session";

export interface SessionSnapshot {
  authenticated: boolean;
  user: SessionUser | undefined;
}

let snapshot: SessionSnapshot = { authenticated: false, user: undefined };

function read(): SessionSnapshot {
  const authenticated = session.isAuthenticated();
  const user = session.user();
  if (authenticated !== snapshot.authenticated || user?.id !== snapshot.user?.id) {
    snapshot = { authenticated, user };
  }
  return snapshot;
}

/** The session as React state: re-renders on sign-in and sign-out, including a 401 ending it. */
export function useSession(): SessionSnapshot {
  return useSyncExternalStore(session.subscribe, read, read);
}
