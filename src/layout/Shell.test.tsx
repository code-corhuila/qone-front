import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { Shell } from "./Shell";
import { session } from "../core/auth/session";
import { identityFixtures, type User } from "../mocks/fixtures/identity";

function renderShell(user: User, path = "/") {
  session.signIn(identityFixtures.devToken(user));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<p>home content</p>} />
          <Route path="/catalog/*" element={<p>catalog content</p>} />
        </Route>
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  session.clear();
  localStorage.clear();
});

// Norm 5.5: navigation and layout common to the whole system. Links depend on the role
// (07-api/authentication.md, access matrix); the person and the sign-out are always visible.
describe("Shell", () => {
  it("shows brand, the signed-in person, the navigation for a student and the page content", () => {
    renderShell(identityFixtures.laura);

    expect(screen.getByRole("heading", { level: 1, name: "Qampus" })).toBeInTheDocument();
    expect(screen.getByText("Laura Gómez")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual(["Home", "Catalog", "Enrollment", "Billing", "Advisor"]);
    expect(within(screen.getByRole("main")).getByText("home content")).toBeInTheDocument();
  });

  it("gives a professor catalog, enrollment and advisor, and an admin catalog and billing", () => {
    const { unmount } = renderShell(identityFixtures.carlos);
    let nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual(["Home", "Catalog", "Enrollment", "Advisor"]);
    unmount();
    session.clear();

    renderShell(identityFixtures.admin);
    nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual(["Home", "Catalog", "Billing", "Advisor"]);
  });

  it("marks the current section and routes the links", async () => {
    const user = userEvent.setup();
    renderShell(identityFixtures.laura, "/catalog/subjects");

    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByText("home content")).toBeInTheDocument();
  });

  it("signs out from the header", async () => {
    const user = userEvent.setup();
    renderShell(identityFixtures.laura);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(session.isAuthenticated()).toBe(false);
  });
});
