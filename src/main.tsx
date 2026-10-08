import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { config } from "./core/config";
import { session } from "./core/auth/session";

const container = document.getElementById("root");
if (!container) {
  throw new Error("index.html must contain an element with id 'root'");
}

async function start(): Promise<void> {
  if (config.useMocks) {
    // Synthetic data (ADR-009): the shell's worker answers /api/v1/* with the 06-data seeds.
    const { worker } = await import("./mocks/browser");
    const { loadPortalMocks } = await import("./mocks/portals");
    await worker.start({ onUnhandledRequest: "bypass" });
    // Each deployed portal exposes its own handlers (ADR-009): added to this one worker.
    await loadPortalMocks(worker);
  }
  session.restore();
  createRoot(container!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
