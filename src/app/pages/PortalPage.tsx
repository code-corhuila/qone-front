import { lazy, Suspense, useMemo, useState, type ComponentType } from "react";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { RemoteBoundary } from "../../core/errors/RemoteBoundary";
import { remoteEntryOf, type PortalName } from "../../remotes/registry";

interface RemoteModule {
  default: ComponentType;
}

// Loads a portal when its route opens (loaded-first, Annex H): registers the remote from the
// shell's environment, imports `<portal>/App` and renders it inside its own RemoteBoundary.
// A missing entry or a failed download becomes the "not available" notice of that area only.
function loadPortal(portal: PortalName): Promise<RemoteModule> {
  const entry = remoteEntryOf(portal);
  if (!entry) {
    return Promise.reject(new Error(`no remote entry configured for portal "${portal}" (VITE_REMOTE_${portal.toUpperCase()}_URL)`));
  }
  // Vite remotes are ES modules: without `type: "module"` the runtime would load remoteEntry.js as a classic script.
  registerRemotes([{ name: portal, entry, type: "module" }]);
  return loadRemote<RemoteModule>(`${portal}/App`).then((module) => {
    if (!module) throw new Error(`portal "${portal}" exposed nothing at ./App`);
    return module;
  });
}

export function PortalPage({ portal }: { portal: PortalName }) {
  const [attempt, setAttempt] = useState(0);
  // A new lazy component per attempt, so a retry downloads the remote again instead of reusing the failure.
  const Remote = useMemo(() => lazy(() => loadPortal(portal)), [portal, attempt]);

  return (
    <RemoteBoundary portal={portal} onRetry={() => setAttempt((n) => n + 1)}>
      <Suspense fallback={<p aria-busy="true">Loading the {portal} portal...</p>}>
        <Remote />
      </Suspense>
    </RemoteBoundary>
  );
}
