import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "./useSession";

// Guards the protected routes of the shell and of every portal (Annex H): without a session
// the person goes to /login carrying the route they asked for, and comes back to it after
// signing in. Because the session is React state, a 401 that ends it redirects at once.
export function RequireAuth() {
  const { authenticated } = useSession();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname + location.search } }} />;
  }
  return <Outlet />;
}
