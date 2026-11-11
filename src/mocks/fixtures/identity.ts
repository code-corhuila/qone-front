// Synthetic data of the identity domain (ADR-009). The eight people mirror the develop-only demo seed of
// qone-identity-db (06-data/models.md, schema `identity`, same ids); the ADMIN is not seeded there (the identity
// service creates it at start from BOOTSTRAP_ADMIN_EMAIL) and is listed here only so the mocks can sign it in.
// Names and e-mails are synthetic on purpose (`.test` is a reserved TLD, RFC 2606): no real person is described.
// Student codes are digits only, as the v2 contract requires (^[0-9]{6,20}$).
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

const student01 = student(1, "estudiante.01@qampus.test", "Estudiante Demo 01", "2099000001", 6);
const student02 = student(2, "estudiante.02@qampus.test", "Estudiante Demo 02", "2099000002", 5);
const student03 = student(3, "estudiante.03@qampus.test", "Estudiante Demo 03", "2099000003", 6);
const student04 = student(4, "estudiante.04@qampus.test", "Estudiante Demo 04", "2099000004", 7);
const student05 = student(5, "estudiante.05@qampus.test", "Estudiante Demo 05", "2099000005", 7);
const professor01 = staff(1, "profesor.01@qampus.test", "Profesor Demo 01", "PROFESSOR");
const professor02 = staff(2, "profesor.02@qampus.test", "Profesor Demo 02", "PROFESSOR");
const professor03 = staff(3, "profesor.03@qampus.test", "Profesor Demo 03", "PROFESSOR");
const admin = staff(1, "admin@qampus.test", "Administrador", "ADMIN");

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
  student01,
  student02,
  student03,
  student04,
  student05,
  professor01,
  professor02,
  professor03,
  admin,
  users: [student01, student02, student03, student04, student05, professor01, professor02, professor03, admin],
  authResponse,
  devToken,
};
