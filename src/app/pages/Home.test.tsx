import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { session } from "../../core/auth/session";
import { identityFixtures } from "../../mocks/fixtures/identity";
import { Home } from "./Home";

beforeEach(() => {
  session.clear();
  localStorage.clear();
});

// The home greets the person by first name and offers one card per portal of their role.
describe("Home", () => {
  it("greets a student and links one card per portal", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.laura));
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Hello, Laura" })).toBeInTheDocument();
    expect(screen.getByText("Student · Term 2026-B")).toBeInTheDocument();
    const cards = within(screen.getByRole("list")).getAllByRole("link");
    expect(cards.map((c) => c.getAttribute("href"))).toEqual(["/catalog", "/enrollment", "/billing", "/advisor"]);
    expect(cards[3]).toHaveTextContent("Ask the academic advisor and confirm the plans it proposes.");
  });

  it("gives an admin the cards of the admin's portals", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.admin));
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText("Administrator · Term 2026-B")).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getAllByRole("link").map((c) => c.getAttribute("href"))).toEqual(["/catalog", "/billing", "/advisor"]);
  });
});
