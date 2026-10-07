import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { session } from "../core/auth/session";
import { identityFixtures } from "../mocks/fixtures/identity";

beforeEach(() => {
  session.clear();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("App shell", () => {
  it("renders the Qampus heading inside a main landmark", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Qampus" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("protects the home route: a signed-out visitor sees the sign-in", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: "Sign in" })).toBeInTheDocument();
  });

  it("greets a signed-in person on the home route, inside the layout with navigation", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.carlos));
    render(<App />);

    expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("answers an unknown route with the 404 page (Annex H)", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.laura));
    window.history.replaceState(null, "", "/does-not-exist");
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  });
});
