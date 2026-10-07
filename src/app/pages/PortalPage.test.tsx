import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const loadRemote = vi.fn();
const registerRemotes = vi.fn();
vi.mock("@module-federation/runtime", () => ({
  loadRemote: (...args: unknown[]) => loadRemote(...args),
  registerRemotes: (...args: unknown[]) => registerRemotes(...args),
}));

import { PortalPage } from "./PortalPage";

function renderPortal(name: "catalog" | "billing") {
  return render(
    <MemoryRouter initialEntries={[`/${name}/anything`]}>
      <Routes>
        <Route path={`/${name}/*`} element={<PortalPage portal={name} />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  loadRemote.mockReset();
  registerRemotes.mockReset();
  vi.unstubAllEnvs();
  vi.stubEnv("VITE_GATEWAY_URL", "http://gateway.test");
});

// Annex H: a remote is downloaded when its route opens (loaded-first); a missing or failing
// remote disables only its area.
describe("PortalPage", () => {
  it("registers the remote from the shell's environment and renders the module it exposes", async () => {
    vi.stubEnv("VITE_REMOTE_CATALOG_URL", "http://localhost:5002/remoteEntry.js");
    loadRemote.mockResolvedValue({ default: () => <p>catalog screens</p> });

    renderPortal("catalog");

    expect(await screen.findByText("catalog screens")).toBeInTheDocument();
    expect(registerRemotes).toHaveBeenCalledWith([{ name: "catalog", entry: "http://localhost:5002/remoteEntry.js" }]);
    expect(loadRemote).toHaveBeenCalledWith("catalog/App");
  });

  it("shows the unavailable message when the remote fails to load, and the retry asks again", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("VITE_REMOTE_CATALOG_URL", "http://localhost:5002/remoteEntry.js");
    loadRemote.mockRejectedValueOnce(new Error("Failed to fetch remoteEntry.js")).mockResolvedValueOnce({ default: () => <p>catalog screens</p> });

    renderPortal("catalog");

    expect(await screen.findByRole("alert")).toHaveTextContent("The catalog portal is not available right now.");
    screen.getByRole("button", { name: "Retry" }).click();
    expect(await screen.findByText("catalog screens")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("shows the unavailable message when the shell has no entry for the portal", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderPortal("billing");

    expect(await screen.findByRole("alert")).toHaveTextContent("The billing portal is not available right now.");
    expect(loadRemote).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
