import { NavLink, Outlet } from "react-router";
import { session, type Role } from "../core/auth/session";
import { useSession } from "../core/auth/useSession";
import { portalsFor } from "../remotes/registry";

export const ROLE_TEXT: Record<Role, string> = { STUDENT: "Student", PROFESSOR: "Professor", ADMIN: "Administrator", SERVICE: "Service" };
export const TERM = "2026-B";

// Navigation and layout common to the whole system (norm 5.5): the brand, the links the person's
// role may open (one per portal, from the registry), the person and the sign-out in the sidebar.
// Every portal renders in `.content`, which carries the design system (styles/content.css).
export function Shell() {
  const { user } = useSession();
  const links = user ? portalsFor(user.role) : [];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>Qampus</h1>
          <span className="chip">{TERM}</span>
        </div>
        <nav aria-label="Main">
          <ul className="nav-list">
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
          <div className="person">
            <strong>{user.name}</strong>
            <span>{ROLE_TEXT[user.role]}</span>
            <br />
            <button type="button" className="link-button" onClick={() => session.clear()}>
              Sign out
            </button>
          </div>
        ) : null}
        <img className="institution" src="/brand/logo-corhuila.png" alt="CORHUILA" />
      </aside>
      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
