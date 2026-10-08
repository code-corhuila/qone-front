import { http, HttpResponse, type RequestHandler } from "msw";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { portals, remoteEntryOf, type PortalName } from "../remotes/registry";

type HandlerFactory = (msw: { http: typeof http; HttpResponse: typeof HttpResponse }) => RequestHandler[];

interface MockWorker {
  use(...handlers: RequestHandler[]): void;
}

// Synthetic data for the whole front (ADR-009): with VITE_USE_MOCKS the shell runs the one MSW
// worker, and every deployed portal contributes the handlers of its domain through the module
// it exposes as `<portal>/mocks`. The handlers are built here with the shell's own msw
// primitives, so they belong to the same instance as the worker. A portal without an entry in
// this environment, or without a mocks module, is skipped; the others still load.
export async function loadPortalMocks(worker: MockWorker): Promise<PortalName[]> {
  const loaded: PortalName[] = [];
  for (const portal of portals) {
    const entry = remoteEntryOf(portal.name);
    if (!entry) continue;
    registerRemotes([{ name: portal.name, entry }]);
    try {
      const module = await loadRemote<{ default: HandlerFactory }>(`${portal.name}/mocks`);
      if (!module?.default) continue;
      worker.use(...module.default({ http, HttpResponse }));
      loaded.push(portal.name);
    } catch (cause) {
      console.info(`[shell] portal "${portal.name}" offers no mocks module`, cause);
    }
  }
  return loaded;
}
