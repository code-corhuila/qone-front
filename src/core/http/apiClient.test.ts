// @vitest-environment node
// Core level (ADR-009): no DOM. Node's fetch rejects jsdom's AbortSignal, so the client is
// tested in the Node environment, where MSW intercepts fetch exactly as in the browser worker.
import { http, HttpResponse, delay } from "msw";
import { server } from "../../mocks/server";
import { identityFixtures } from "../../mocks/fixtures/identity";
import { session } from "../auth/session";
import { apiClient } from "./apiClient";
import { ApiError } from "./errors";

const GATEWAY = "http://gateway.test";

function signedToken(sub = identityFixtures.laura.id): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ sub, role: "STUDENT", name: "Laura Gómez", exp })}.c2ln`;
}

beforeEach(() => {
  session.clear();
});

describe("apiClient - what the container does for every portal (Annex H)", () => {
  it("sends relative paths to the gateway with JSON, the bearer token and a fresh X-Correlation-Id each time", async () => {
    const seen: Array<{ auth: string | null; correlation: string | null; accept: string | null }> = [];
    server.use(
      http.get(`${GATEWAY}/api/v1/identity/users/me`, ({ request }) => {
        seen.push({
          auth: request.headers.get("authorization"),
          correlation: request.headers.get("x-correlation-id"),
          accept: request.headers.get("accept"),
        });
        return HttpResponse.json(identityFixtures.laura);
      }),
    );
    const token = signedToken();
    session.signIn(token);

    const first = await apiClient.get<{ id: string }>("/api/v1/identity/users/me");
    const second = await apiClient.get<{ id: string }>("/api/v1/identity/users/me");

    expect(first.id).toBe(identityFixtures.laura.id);
    expect(second.id).toBe(identityFixtures.laura.id);
    expect(seen).toHaveLength(2);
    expect(seen[0]?.auth).toBe(`Bearer ${token}`);
    expect(seen[0]?.accept).toBe("application/json");
    expect(seen[0]?.correlation).toMatch(/^[0-9a-f-]{36}$/);
    expect(seen[1]?.correlation).not.toBe(seen[0]?.correlation);
  });

  it("sends no Authorization header when signed out, and the Idempotency-Key when a creation gives one", async () => {
    let received: { auth: string | null; key: string | null; body: unknown } | undefined;
    server.use(
      http.post(`${GATEWAY}/api/v1/identity/auth/register`, async ({ request }) => {
        received = { auth: request.headers.get("authorization"), key: request.headers.get("idempotency-key"), body: await request.json() };
        return HttpResponse.json(identityFixtures.authResponse(identityFixtures.laura), { status: 201, headers: { Location: "/api/v1/identity/users/x" } });
      }),
    );

    const result = await apiClient.post<{ token: string }>("/api/v1/identity/auth/register", { email: "a@b.co" }, { idempotencyKey: "reg-0001-abcd" });

    expect(result.token).toBeTypeOf("string");
    expect(received?.auth).toBeNull();
    expect(received?.key).toBe("reg-0001-abcd");
    expect(received?.body).toEqual({ email: "a@b.co" });
  });

  it("turns the common error envelope into an ApiError with code, traceId and the person's message", async () => {
    server.use(
      http.post(`${GATEWAY}/api/v1/billing/invoices`, () =>
        HttpResponse.json(
          { error: "BUSINESS_RULE_VIOLATION", message: "INV-BIL-001: one invoice per student and term", traceId: "trace-42" },
          { status: 422 },
        ),
      ),
    );

    const failure = await apiClient.post("/api/v1/billing/invoices", {}, { idempotencyKey: "inv-0001-abcd" }).catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(ApiError);
    const error = failure as ApiError;
    expect(error.status).toBe(422);
    expect(error.code).toBe("BUSINESS_RULE_VIOLATION");
    expect(error.traceId).toBe("trace-42");
    expect(error.message).toBe("A rule of the university prevents this action.");
  });

  it("ends the session on any 401 (norm 5.5) and still throws", async () => {
    server.use(http.get(`${GATEWAY}/api/v1/catalog/subjects`, () => HttpResponse.json({ error: "UNAUTHORIZED", message: "token expired", traceId: "t" }, { status: 401 })));
    session.signIn(signedToken());
    const ended: boolean[] = [];
    session.subscribe(() => ended.push(session.isAuthenticated()));

    await expect(apiClient.get("/api/v1/catalog/subjects")).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(session.isAuthenticated()).toBe(false);
    expect(ended).toEqual([false]);
  });

  it("gives up after the per-request timeout with a TIMEOUT error of status 0", async () => {
    server.use(http.get(`${GATEWAY}/api/v1/slow`, async () => { await delay(200); return HttpResponse.json({}); }));

    await expect(apiClient.get("/api/v1/slow", { timeoutMs: 50 })).rejects.toMatchObject({ status: 0, code: "TIMEOUT" });
  });

  it("reports a network failure as NETWORK with status 0", async () => {
    server.use(http.get(`${GATEWAY}/api/v1/down`, () => HttpResponse.error()));

    await expect(apiClient.get("/api/v1/down")).rejects.toMatchObject({ status: 0, code: "NETWORK" });
  });

  it("returns undefined for 204 and the parsed body otherwise, and refuses absolute URLs (portals only know relative paths)", async () => {
    server.use(http.delete(`${GATEWAY}/api/v1/catalog/sections/s1/reservations/r1`, () => new HttpResponse(null, { status: 204 })));

    await expect(apiClient.del("/api/v1/catalog/sections/s1/reservations/r1")).resolves.toBeUndefined();
    await expect(apiClient.get("http://evil.test/api/v1/x")).rejects.toThrow(/relative/);
  });

  it("uses the recorded correlation id as traceId when the body is not the envelope", async () => {
    server.use(http.get(`${GATEWAY}/api/v1/html`, () => new HttpResponse("<html>bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } })));

    const error = (await apiClient.get("/api/v1/html").catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(502);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
