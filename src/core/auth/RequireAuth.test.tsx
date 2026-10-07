import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { session } from "./session";
import { RequireAuth } from "./RequireAuth";
import { identityFixtures } from "../../mocks/fixtures/identity";

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "none";
  return <p>login page, from {from}</p>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route element={<RequireAuth />}>
          <Route path="/enrollment" element={<p>enrollment portal</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  session.clear();
  localStorage.clear();
});

// Annex H: "Sin sesión, la ruta protegida lleva al inicio de sesión y regresa a la ruta pedida".
describe("RequireAuth", () => {
  it("sends a signed-out visitor to /login and remembers the route they asked for", () => {
    renderAt("/enrollment");
    expect(screen.getByText("login page, from /enrollment")).toBeInTheDocument();
  });

  it("renders the protected route for a signed-in person", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.laura));
    renderAt("/enrollment");
    expect(screen.getByText("enrollment portal")).toBeInTheDocument();
  });

  it("reacts to the session ending while the page is open (any 401 ends the session)", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.laura));
    renderAt("/enrollment");
    expect(screen.getByText("enrollment portal")).toBeInTheDocument();

    act(() => session.clear());

    expect(screen.getByText("login page, from /enrollment")).toBeInTheDocument();
  });
});
