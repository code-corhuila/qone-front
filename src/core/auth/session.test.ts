import { session, parseJwtClaims } from "./session";

// A JWT with a fixed payload; the signature is irrelevant on the client (services validate).
function token(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "RS256", typ: "JWT" })}.${b64(payload)}.c2lnbmF0dXJl`;
}

const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 60;

describe("parseJwtClaims", () => {
  it("reads sub, role, name and exp from the payload without verifying the signature", () => {
    const claims = parseJwtClaims(token({ sub: "u-1", role: "STUDENT", name: "Laura Gómez", exp: future }));
    expect(claims).toEqual({ sub: "u-1", role: "STUDENT", name: "Laura Gómez", exp: future });
  });

  it("returns undefined for a malformed token", () => {
    expect(parseJwtClaims("not-a-jwt")).toBeUndefined();
    expect(parseJwtClaims("a.b")).toBeUndefined();
    expect(parseJwtClaims(`${Buffer.from("{}").toString("base64url")}.%%%.sig`)).toBeUndefined();
  });

  it("requires sub and exp, as every service does (5.3.7)", () => {
    expect(parseJwtClaims(token({ role: "STUDENT", exp: future }))).toBeUndefined();
    expect(parseJwtClaims(token({ sub: "u-1", role: "STUDENT" }))).toBeUndefined();
  });

  it("defaults a missing role to STUDENT only for display, and keeps a missing name empty", () => {
    expect(parseJwtClaims(token({ sub: "u-1", exp: future }))).toEqual({ sub: "u-1", role: "STUDENT", name: "", exp: future });
  });
});

describe("session", () => {
  beforeEach(() => {
    session.clear();
    localStorage.clear();
  });

  it("starts signed out", () => {
    expect(session.isAuthenticated()).toBe(false);
    expect(session.token()).toBeUndefined();
    expect(session.user()).toBeUndefined();
  });

  it("signs in from a token, exposes the user and persists across a reload", () => {
    const t = token({ sub: "u-1", role: "PROFESSOR", name: "Carlos Méndez", exp: future });
    const result = session.signIn(t);

    expect(result.ok).toBe(true);
    expect(session.isAuthenticated()).toBe(true);
    expect(session.token()).toBe(t);
    expect(session.user()).toEqual({ id: "u-1", role: "PROFESSOR", name: "Carlos Méndez" });
    expect(localStorage.getItem("qampus.session")).toBe(t);

    session.restore();
    expect(session.token()).toBe(t);
  });

  it("rejects an expired or malformed token and stays signed out", () => {
    expect(session.signIn(token({ sub: "u-1", role: "STUDENT", exp: past }))).toEqual({ ok: false, reason: "expired" });
    expect(session.signIn("garbage")).toEqual({ ok: false, reason: "malformed" });
    expect(session.isAuthenticated()).toBe(false);
  });

  it("treats a persisted token that expired while away as signed out", () => {
    localStorage.setItem("qampus.session", token({ sub: "u-1", role: "STUDENT", exp: past }));
    session.restore();
    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("qampus.session")).toBeNull();
  });

  it("clears everything on sign out and notifies subscribers of every change", () => {
    const seen: boolean[] = [];
    const unsubscribe = session.subscribe(() => seen.push(session.isAuthenticated()));

    session.signIn(token({ sub: "u-1", role: "STUDENT", exp: future }));
    session.clear();
    unsubscribe();
    session.signIn(token({ sub: "u-2", role: "STUDENT", exp: future }));

    expect(seen).toEqual([true, false]);
    expect(localStorage.getItem("qampus.session")).toBe(session.token());
  });
});
