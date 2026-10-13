import { NavLink, Outlet } from "react-router";
import { session } from "../core/auth/session";
import { useSession } from "../core/auth/useSession";
import { portalsFor } from "../remotes/registry";

// Navigation and layout common to the whole system (norm 5.5): brand, the links the person's
// role may open (one per portal, from the registry), the person and the sign-out. The page
// content renders in the main landmark through the router outlet.
export function Shell() {
  const { user } = useSession();
  const links = user ? portalsFor(user.role) : [];

  return (
    <>
      <header>
        <h1>Qampus</h1>
        <nav aria-label="Main">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {links.map((portal) => (
              <li key={portal.name}>
                <NavLink to={portal.route}>{portal.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {user ? (
          <p>
            <span>{user.name}</span> <span>{user.role}</span>{" "}
            <button type="button" onClick={() => session.clear()}>
              Sign out
            </button>
          </p>
        ) : null}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
