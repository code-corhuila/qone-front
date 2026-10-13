import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const loadRemote = vi.fn();
const registerRemotes = vi.fn();
vi.mock("@module-federation/runtime", () => ({
  loadRemote: (...args: unknown[]) => loadRemote(...args),
  registerRemotes: (...args: unknown[]) => registerRemotes(...args),
}));

import { SignInPage } from "./SignInPage";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login/*" element={<SignInPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  loadRemote.mockReset();
  registerRemotes.mockReset();
  vi.unstubAllEnvs();
  vi.stubEnv("VITE_GATEWAY_URL", "http://gateway.test");
  vi.stubEnv("VITE_REMOTE_IDENTITY_URL", "");
});

// HU-AUT-001 and norm 5.5.2: the identity portal where it is deployed, the development
// sign-in only where VITE_DEV_LOGIN is "true".
describe("SignInPage", () => {
  it("mounts the identity portal, also below /login (the registration)", async () => {
    vi.stubEnv("VITE_REMOTE_IDENTITY_URL", "http://localhost:5001/remoteEntry.js");
    vi.stubEnv("VITE_DEV_LOGIN", "false");
    loadRemote.mockResolvedValue({ default: () => <p>identity screens</p> });

    renderAt("/login/register");

    expect(await screen.findByText("identity screens")).toBeInTheDocument();
    expect(loadRemote).toHaveBeenCalledWith("identity/App");
    expect(screen.queryByTestId("dev-sign-in")).not.toBeInTheDocument();
  });

  it("keeps the development sign-in folded below the portal where it is enabled", async () => {
    vi.stubEnv("VITE_REMOTE_IDENTITY_URL", "http://localhost:5001/remoteEntry.js");
    vi.stubEnv("VITE_DEV_LOGIN", "true");
    loadRemote.mockResolvedValue({ default: () => <p>identity screens</p> });

    renderAt("/login");

    expect(await screen.findByText("identity screens")).toBeInTheDocument();
    expect(screen.getByText("Development sign-in with a token")).toBeInTheDocument();
    expect(screen.getByTestId("dev-sign-in")).toBeInTheDocument();
  });

  it("without the portal shows the development sign-in, or says the sign-in is not available", () => {
    vi.stubEnv("VITE_DEV_LOGIN", "true");
    const { unmount } = renderAt("/login");
    expect(screen.getByTestId("dev-sign-in")).toBeInTheDocument();
    unmount();

    vi.stubEnv("VITE_DEV_LOGIN", "false");
    renderAt("/login");
    expect(screen.getByText("The sign-in is not available in this environment.")).toBeInTheDocument();
    expect(loadRemote).not.toHaveBeenCalled();
  });
});
