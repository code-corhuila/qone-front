/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// The container (shell). It will expose `shell/apiClient` and `shell/session` to the domain
// portals (Annex H) and load each portal lazily by route with `loaded-first`, so a portal
// that is down only disables its own area. Exposes and remotes are declared in
// src/remotes/registry.ts as they are built; this file reads nothing else from the environment:
// portals never learn the gateway URL (norm 5.4.1).
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      filename: "remoteEntry.js",
      exposes: {},
      remotes: {},
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router": { singleton: true },
      },
      shareStrategy: "loaded-first",
    }),
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  build: { target: "esnext", sourcemap: false },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
