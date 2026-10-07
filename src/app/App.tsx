import { BrowserRouter, Route, Routes } from "react-router";
import { RequireAuth } from "../core/auth/RequireAuth";
import { Home } from "./pages/Home";
import { SignInPage } from "./pages/SignInPage";

// The container's root: brand, main landmark and the routes. /login is public; everything
// else sits behind RequireAuth. The layout, the remotes registry, RemoteBoundary and the 404
// page arrive with HU-WEB-001.
export function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>Qampus</h1>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<SignInPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}
