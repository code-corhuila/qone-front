import { BrowserRouter, Route, Routes } from "react-router";
import { RequireAuth } from "../core/auth/RequireAuth";
import { Shell } from "../layout/Shell";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { PortalPage } from "./pages/PortalPage";
import { SignInPage } from "./pages/SignInPage";

// The container's root. /login is public; everything else sits behind RequireAuth inside the
// Shell layout: the home, one mount route per domain portal (loaded on demand, each in its own
// RemoteBoundary) and the 404 (Annex H).
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <header>
                <h1>Qampus</h1>
              </header>
              <main>
                <SignInPage />
              </main>
            </>
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
