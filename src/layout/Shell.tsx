import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { session, type Role } from "../core/auth/session";
import { useSession } from "../core/auth/useSession";
import { portalsFor } from "../remotes/registry";
import { CloseIcon, HomeIcon, MenuIcon, PORTAL_ICON, SignOutIcon } from "./icons";

export const ROLE_TEXT: Record<Role, string> = { STUDENT: "Student", PROFESSOR: "Professor", ADMIN: "Administrator", SERVICE: "Service" };
export const TERM = "2026-B";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Navigation and layout common to the whole system (norm 5.5). On a wide screen the sidebar is
// always there; on a phone or tablet it is a drawer opened from the top bar, closed by its button,
// by Escape, by the backdrop or by following a link. Every portal renders in `.content`, which
// carries the design system (styles/content.css).
export function Shell() {
  const { user } = useSession();
  const links = user ? portalsFor(user.role) : [];
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  function close() {
    setOpen(false);
    menuButton.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) close();
  }

  return (
    <div className={open ? "app drawer-open" : "app"} onKeyDown={onKeyDown}>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="topbar">
        <button
          ref={menuButton}
          type="button"
          className="icon-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <span className="topbar-brand">Qampus</span>
        <span className="chip">{TERM}</span>
      </header>
      <div className="backdrop" aria-hidden="true" onClick={close} />
      <aside id="sidebar" className="sidebar">
        <div className="brand">
          <h1>Qampus</h1>
          <span className="chip">{TERM}</span>
        </div>
        <nav aria-label="Main">
          <ul className="nav-list">
            <li>
              <NavLink to="/" end>
                <HomeIcon />
                <span>Home</span>
              </NavLink>
            </li>
            {links.map((portal) => {
              const PortalIcon = PORTAL_ICON[portal.name];
              return (
                <li key={portal.name}>
                  <NavLink to={portal.route}>
                    <PortalIcon />
                    <span>{portal.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        {user ? (
          <div className="person">
            <span className="avatar" aria-hidden="true">
              {initials(user.name)}
            </span>
            <div className="person-text">
              <strong>{user.name}</strong>
              <span>{ROLE_TEXT[user.role]}</span>
            </div>
            <button type="button" className="icon-button" aria-label="Sign out" title="Sign out" onClick={() => session.clear()}>
              <SignOutIcon />
            </button>
          </div>
        ) : null}
        <img className="institution" src="/brand/logo-corhuila.png" alt="CORHUILA" width="88" height="88" />
      </aside>
      <main id="content" className="main" tabIndex={-1}>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
