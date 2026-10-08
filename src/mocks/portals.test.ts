// @vitest-environment node
import { http, HttpResponse } from "msw";

const loadRemote = vi.fn();
const registerRemotes = vi.fn();
vi.mock("@module-federation/runtime", () => ({
  loadRemote: (...args: unknown[]) => loadRemote(...args),
  registerRemotes: (...args: unknown[]) => registerRemotes(...args),
}));

import { loadPortalMocks } from "./portals";

// ADR-009: with VITE_USE_MOCKS the shell runs the one worker and each deployed portal
// contributes its handlers through its exposed `<portal>/mocks` module, built with the shell's
// msw primitives. A portal without entry or whose module fails is skipped; the rest still load.
describe("loadPortalMocks", () => {
  const worker = { use: vi.fn() };

  beforeEach(() => {
    loadRemote.mockReset();
    registerRemotes.mockReset();
    worker.use.mockReset();
    vi.unstubAllEnvs();
  });

  it("registers each configured portal, asks for its mocks module and adds the handlers it builds", async () => {
    vi.stubEnv("VITE_REMOTE_CATALOG_URL", "http://localhost:5002/remoteEntry.js");
    vi.stubEnv("VITE_REMOTE_BILLING_URL", "http://localhost:5004/remoteEntry.js");
    const handler = http.get("*/api/v1/catalog/health", () => HttpResponse.json({}));
    const factory = vi.fn(() => [handler]);
    loadRemote.mockImplementation((id: string) => (id === "catalog/mocks" ? Promise.resolve({ default: factory }) : Promise.reject(new Error("no mocks"))));

    const loaded = await loadPortalMocks(worker);

    expect(registerRemotes).toHaveBeenCalledWith([{ name: "catalog", entry: "http://localhost:5002/remoteEntry.js" }]);
    expect(registerRemotes).toHaveBeenCalledWith([{ name: "billing", entry: "http://localhost:5004/remoteEntry.js" }]);
    expect(factory).toHaveBeenCalledWith({ http, HttpResponse });
    expect(worker.use).toHaveBeenCalledWith(handler);
    expect(loaded).toEqual(["catalog"]);
  });

  it("does nothing when no portal is configured", async () => {
    const loaded = await loadPortalMocks(worker);

    expect(loaded).toEqual([]);
    expect(loadRemote).not.toHaveBeenCalled();
    expect(worker.use).not.toHaveBeenCalled();
  });
});
