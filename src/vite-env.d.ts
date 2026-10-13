/// <reference types="vite/client" />

// Every variable the container reads. Portals read none of these (norm 5.4.1).
interface ImportMetaEnv {
  /** Origin of qone-api-gateway, the only piece the browser talks to. */
  readonly VITE_GATEWAY_URL: string;
  /** "true" enables the development sign-in (norm 5.5.2). Never "true" on main. */
  readonly VITE_DEV_LOGIN?: string;
  /** "true" serves synthetic data with MSW instead of calling the gateway (ADR-009). */
  readonly VITE_USE_MOCKS?: string;
  /** remoteEntry.js of each domain portal; empty when the portal is not deployed (Annex H). */
  readonly VITE_REMOTE_IDENTITY_URL?: string;
  readonly VITE_REMOTE_CATALOG_URL?: string;
  readonly VITE_REMOTE_ENROLLMENT_URL?: string;
  readonly VITE_REMOTE_BILLING_URL?: string;
  readonly VITE_REMOTE_ADVISOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
