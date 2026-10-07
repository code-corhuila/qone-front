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

  it("greets a signed-in person on the home route", () => {
    session.signIn(identityFixtures.devToken(identityFixtures.carlos));
    render(<App />);

    expect(screen.getByText("Carlos Méndez")).toBeInTheDocument();
    expect(screen.getByText("PROFESSOR")).toBeInTheDocument();
  });
});
