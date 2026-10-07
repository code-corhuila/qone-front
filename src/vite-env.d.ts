/// <reference types="vite/client" />

// Every variable the container reads. Portals read none of these (norm 5.4.1).
interface ImportMetaEnv {
  /** Origin of qone-api-gateway, the only piece the browser talks to. */
  readonly VITE_GATEWAY_URL: string;
  /** "true" enables the development sign-in (norm 5.5.2). Never "true" on main. */
  readonly VITE_DEV_LOGIN?: string;
  /** "true" serves synthetic data with MSW instead of calling the gateway (ADR-009). */
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
