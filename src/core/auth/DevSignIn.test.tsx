import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { session } from "./session";
import { DevSignIn } from "./DevSignIn";
import { identityFixtures } from "../../mocks/fixtures/identity";

function renderLogin(from?: string) {
  const entry = from ? { pathname: "/login", state: { from: { pathname: from } } } : "/login";
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<DevSignIn />} />
        <Route path="/" element={<p>home</p>} />
        <Route path="/billing" element={<p>billing portal</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  session.clear();
  localStorage.clear();
});

// Norm 5.5.2: until the identity portal exists, the container accepts a token from
// qone-infra/scripts/dev-token.sh. Annex H form rules: label per field, error beside the field
// with aria-describedby, button disabled while there is nothing to send.
describe("DevSignIn", () => {
  it("has a labelled token field, a disabled button until something is typed, and a marker for the CI grep", () => {
    renderLogin();
    const field = screen.getByLabelText("Development token");
    expect(field).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(screen.getByTestId("dev-sign-in")).toBeInTheDocument();
  });

  it("shows the error beside the field for a malformed token and does not sign in", async () => {
    const user = userEvent.setup();
    renderLogin();
    const field = screen.getByLabelText("Development token");

    await user.type(field, "not-a-token");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const error = screen.getByText("This is not a JWT: expected header.payload.signature.");
    expect(field).toHaveAttribute("aria-describedby", error.id);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(session.isAuthenticated()).toBe(false);
  });

  it("rejects an expired token with its own message", async () => {
    const user = userEvent.setup();
    renderLogin();
    const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, "");
    const expired = `${b64({ alg: "RS256" })}.${b64({ sub: "u", exp: 1 })}.sig`;

    await user.type(screen.getByLabelText("Development token"), expired);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("This token has expired. Mint a new one with dev-token.sh.")).toBeInTheDocument();
    expect(session.isAuthenticated()).toBe(false);
  });

  it("signs in with a valid token and returns to the route the person asked for", async () => {
    const user = userEvent.setup();
    renderLogin("/billing");

    await user.type(screen.getByLabelText("Development token"), identityFixtures.devToken(identityFixtures.santiago));
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(session.user()?.name).toBe("Santiago Rojas");
    expect(screen.getByText("billing portal")).toBeInTheDocument();
  });

  it("goes home when nobody asked for a route", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Development token"), identityFixtures.devToken(identityFixtures.laura));
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("home")).toBeInTheDocument();
  });
});
