import { identityHandlers } from "./identity";

// Every handler the shell knows. Portals register their own domain handlers in their repository;
// in development the shell's worker is the only one running (ADR-009).
export const handlers = [...identityHandlers];
