import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// MSW in Node, for Vitest. Tests add or override handlers with `server.use(...)`;
// `src/test/setup.ts` starts it and resets the overrides after each test.
export const server = setupServer(...handlers);
