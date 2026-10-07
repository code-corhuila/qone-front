// Synthetic data of the identity domain (ADR-009). These rows ARE the seed of
// qone-identity-db (06-data/models.md, schema `identity`): the nine people of the v1.0.0 demo
// (quorum-one/backend/app/seed.py) so screenshots stay recognizable. Student codes drop the
// hyphen of the prototype because the v2 contract requires digits only (^[0-9]{6,20}$).
// Shapes follow 07-api/contracts/openapi/qone-identity-api.yaml. Passwords never travel here.

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
const program = "Ingeniería de Software";

function student(n: number, email: string, name: string, studentCode: string, semester: number): User {
  return { id: `11111111-1111-4111-8111-11111111111${n}`, email, name, role: "STUDENT", studentCode, program, semester, createdAt };
}

function staff(n: number, email: string, name: string, role: "PROFESSOR" | "ADMIN"): User {
  const prefix = role === "PROFESSOR" ? "22222222-2222-4222-8222-22222222222" : "33333333-3333-4333-8333-33333333333";
  return { id: `${prefix}${n}`, email, name, role, studentCode: null, program: null, semester: null, createdAt };
}

const laura = student(1, "laura.gomez@uni.edu.co", "Laura Gómez", "202110342", 6);
const santiago = student(2, "santiago.rojas@uni.edu.co", "Santiago Rojas", "202201983", 5);
const maria = student(3, "maria.cabrera@uni.edu.co", "María José Cabrera", "202111205", 6);
const andres = student(4, "andres.pineda@uni.edu.co", "Andrés Pineda", "202008761", 7);
const valentina = student(5, "valentina.suarez@uni.edu.co", "Valentina Suárez", "202009114", 7);
const carlos = staff(1, "carlos.ramirez@uni.edu.co", "Carlos Ramírez", "PROFESSOR");
const ana = staff(2, "ana.torres@uni.edu.co", "Ana Torres", "PROFESSOR");
const jorge = staff(3, "jorge.medina@uni.edu.co", "Jorge Medina", "PROFESSOR");
const admin = staff(1, "admin@uni.edu.co", "Patricia Mora", "ADMIN");

/** An unsigned development token for a user: header.payload.signature, RS256 claimed, 8 hours. */
function devToken(user: User): string {
  // UTF-8 first, then base64url: names carry accents and btoa alone would emit latin1 bytes.
  const b64 = (o: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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
  maria,
  andres,
  valentina,
  carlos,
  ana,
  jorge,
  admin,
  users: [laura, santiago, maria, andres, valentina, carlos, ana, jorge, admin],
  authResponse,
  devToken,
};
