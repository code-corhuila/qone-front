// Synthetic data of the identity domain (ADR-009). These rows ARE the seed of
// qone-identity-db (06-data/models.md, schema `identity`): same people as the v1.0.0 demo so
// screenshots stay recognizable. Shapes follow 07-api/contracts/openapi/qone-identity-api.yaml
// and are validated against it by the contract test. Passwords never travel in fixtures.

export interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN" | "SERVICE";
  studentCode: string | null;
  program: string | null;
  semester: number | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

const createdAt = "2026-08-01T12:00:00Z";

const laura: User = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "laura.gomez@uni.edu.co",
  name: "Laura Gómez",
  role: "STUDENT",
  studentCode: "20261001",
  program: "Ingeniería de Software",
  semester: 6,
  createdAt,
};

const santiago: User = {
  id: "11111111-1111-4111-8111-111111111112",
  email: "santiago.rojas@uni.edu.co",
  name: "Santiago Rojas",
  role: "STUDENT",
  studentCode: "20261002",
  program: "Ingeniería de Software",
  semester: 3,
  createdAt,
};

const carlos: User = {
  id: "22222222-2222-4222-8222-222222222221",
  email: "carlos.mendez@uni.edu.co",
  name: "Carlos Méndez",
  role: "PROFESSOR",
  studentCode: null,
  program: null,
  semester: null,
  createdAt,
};

const admin: User = {
  id: "33333333-3333-4333-8333-333333333331",
  email: "admin@uni.edu.co",
  name: "Administración Académica",
  role: "ADMIN",
  studentCode: null,
  program: null,
  semester: null,
  createdAt,
};

/** An unsigned development token for a user: header.payload.signature, RS256 claimed, 8 hours. */
function devToken(user: User): string {
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: "qone-identity-api", sub: user.id, role: user.role, name: user.name, iat: now, exp: now + 8 * 3600 };
  return `${b64({ alg: "RS256", typ: "JWT" })}.${b64(payload)}.bW9jay1zaWduYXR1cmU`;
}

function authResponse(user: User): AuthResponse {
  return { token: devToken(user), expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString().replace(/\.\d{3}Z$/, "Z"), user };
}

export const identityFixtures = {
  laura,
  santiago,
  carlos,
  admin,
  users: [laura, santiago, carlos, admin],
  authResponse,
  devToken,
};
