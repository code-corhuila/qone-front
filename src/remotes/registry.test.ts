import { portals, portalFor, remoteEntryOf } from "./registry";

// Annex H: the registry says which portals exist and where they mount; the remote entry URL of
// each one comes from the environment of the shell, never from a portal.
describe("remotes registry", () => {
  it("lists the five domain portals in navigation order with their mount route and roles", () => {
    expect(portals.map((p) => p.name)).toEqual(["identity", "catalog", "enrollment", "billing", "advisor"]);
    expect(portals.map((p) => p.route)).toEqual(["/login", "/catalog", "/enrollment", "/billing", "/advisor"]);
    expect(portalFor("catalog")?.roles).toEqual(["STUDENT", "PROFESSOR", "ADMIN"]);
    expect(portalFor("billing")?.roles).toEqual(["STUDENT", "ADMIN"]);
    expect(portalFor("enrollment")?.roles).toEqual(["STUDENT", "PROFESSOR"]);
  });

  it("reads each remote entry from VITE_REMOTE_<NAME>_URL and reports a missing one", () => {
    vi.stubEnv("VITE_REMOTE_CATALOG_URL", "http://localhost:5002/remoteEntry.js");
    vi.stubEnv("VITE_REMOTE_BILLING_URL", "");

    expect(remoteEntryOf("catalog")).toBe("http://localhost:5002/remoteEntry.js");
    expect(remoteEntryOf("billing")).toBeUndefined();
    vi.unstubAllEnvs();
  });

  it("knows nothing about the gateway: a portal receives shell/apiClient instead", () => {
    const source = JSON.stringify(portals);
    expect(source).not.toMatch(/8080|gateway/i);
  });
});
