import { BrowserRouter, Route, Routes } from "react-router";
import { RequireAuth } from "../core/auth/RequireAuth";
import { Shell, TERM } from "../layout/Shell";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { PortalPage } from "./pages/PortalPage";
import { SignInPage } from "./pages/SignInPage";

// The container's root. /login/* is public (the identity portal, or the development sign-in);
// everything else sits behind RequireAuth inside the Shell layout: the home, one mount route
// per domain portal (loaded on demand, each in its own RemoteBoundary) and the 404 (Annex H).
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login/*"
          element={
            <div className="auth">
              <section className="auth-hero" aria-label="Qampus">
                <div className="brand">
                  <h1>Qampus</h1>
                  <span className="chip">{TERM}</span>
                </div>
                <div>
                  <p className="tagline">Your semester, in one place.</p>
                  <p>
                    Pensum, seats, schedules and payments that never contradict each other, and an advisor that
                    answers from your real record and enrolls with you, never without you.
                  </p>
                </div>
                <small>Quorum One · CORHUILA</small>
              </section>
              <main className="auth-panel">
                <div className="content">
                  <img className="institution" src="/brand/logo-corhuila.png" alt="CORHUILA" />
                  <SignInPage />
                </div>
              </main>
            </div>
          }
        />
        <Route element={<RequireAuth />}>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog/*" element={<PortalPage portal="catalog" />} />
            <Route path="/enrollment/*" element={<PortalPage portal="enrollment" />} />
            <Route path="/billing/*" element={<PortalPage portal="billing" />} />
            <Route path="/advisor/*" element={<PortalPage portal="advisor" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
