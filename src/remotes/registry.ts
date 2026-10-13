import type { Role } from "../core/auth/session";

// Which portals exist and where they mount (Annex H, `src/remotes/registry.ts`). One portal
// per domain, named by channel (norm 5.4). The remote entry of each one comes from the shell's
// environment (VITE_REMOTE_<NAME>_URL); a portal never knows the gateway or another portal.

export type PortalName = "identity" | "catalog" | "enrollment" | "billing" | "advisor";

export interface Portal {
  name: PortalName;
  /** Mount route in the shell; the portal owns everything below it. */
  route: string;
  /** Label in the main navigation. */
  label: string;
  /** Roles that see the link (07-api/authentication.md, access matrix). */
  roles: readonly Role[];
}

export const portals: readonly Portal[] = [
  { name: "identity", route: "/login", label: "Sign in", roles: [] },
  { name: "catalog", route: "/catalog", label: "Catalog", roles: ["STUDENT", "PROFESSOR", "ADMIN"] },
  { name: "enrollment", route: "/enrollment", label: "Enrollment", roles: ["STUDENT", "PROFESSOR"] },
  { name: "billing", route: "/billing", label: "Billing", roles: ["STUDENT", "ADMIN"] },
  { name: "advisor", route: "/advisor", label: "Advisor", roles: ["STUDENT", "PROFESSOR", "ADMIN"] },
];

export function portalFor(name: PortalName): Portal | undefined {
  return portals.find((p) => p.name === name);
}

/** Portals a role may open, in navigation order. */
export function portalsFor(role: Role): Portal[] {
  return portals.filter((p) => p.roles.includes(role));
}

/** The remoteEntry.js URL of a portal, or undefined when this environment does not deploy it. */
export function remoteEntryOf(name: PortalName): string | undefined {
  const value = (import.meta.env as Record<string, string | undefined>)[`VITE_REMOTE_${name.toUpperCase()}_URL`];
  return value ? value : undefined;
}
