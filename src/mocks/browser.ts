import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// MSW in the browser, started by main.tsx only when VITE_USE_MOCKS is "true" (ADR-009).
// The shell runs the one worker; portal remotes never start their own.
export const worker = setupWorker(...handlers);
