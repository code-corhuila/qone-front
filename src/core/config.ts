// Configuration the container reads at boot. Only the shell knows the gateway origin (Annex H);
// a portal receives `shell/apiClient` and never this module.

function required(name: keyof ImportMetaEnv, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required (see .env.example)`);
  return value;
}

export const config = {
  /** Origin of qone-api-gateway, without a trailing slash. */
  get gatewayUrl(): string {
    return required("VITE_GATEWAY_URL", import.meta.env.VITE_GATEWAY_URL).replace(/\/+$/, "");
  },
  /** Development sign-in enabled (norm 5.5.2). Never true in a build for main. */
  get devLogin(): boolean {
    return import.meta.env.VITE_DEV_LOGIN === "true";
  },
  /** Serve synthetic data with MSW instead of the gateway (ADR-009). */
  get useMocks(): boolean {
    return import.meta.env.VITE_USE_MOCKS === "true";
  },
};
