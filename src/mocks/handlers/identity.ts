import { http, HttpResponse } from "msw";
import { identityFixtures } from "../fixtures/identity";

// MSW handlers of qone-identity-api (ID-02..ID-04). Paths are relative: the handler matches
// whatever gateway origin the shell is configured with. Errors use the common envelope.
const envelope = (status: number, error: string, message: string) =>
  HttpResponse.json({ error, message, traceId: crypto.randomUUID() }, { status });

export const identityHandlers = [
  http.post("*/api/v1/identity/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
    if (!body?.email || !body.password) {
      return envelope(400, "VALIDATION_ERROR", "the request has invalid fields");
    }
    const email = body.email.toLowerCase();
    const user = identityFixtures.users.find((u) => u.email === email);
    // Synthetic rule: any password of 8+ characters signs in a seeded user (no hashes in mocks).
    if (!user || body.password.length < 8) {
      return envelope(401, "UNAUTHORIZED", "wrong e-mail or password");
    }
    return HttpResponse.json(identityFixtures.authResponse(user));
  }),

  http.get("*/api/v1/identity/users/me", ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return envelope(401, "UNAUTHORIZED", "missing or invalid token");
    const payload = auth.slice(7).split(".")[1];
    const claims = payload ? (JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: string }) : {};
    const user = identityFixtures.users.find((u) => u.id === claims.sub);
    return user ? HttpResponse.json(user) : envelope(401, "UNAUTHORIZED", "missing or invalid token");
  }),

  http.get("*/api/v1/identity/health", () => HttpResponse.json({ status: "ok", service: "qone-identity-api", version: "2.0.0" })),
];
