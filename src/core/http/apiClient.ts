// The single HTTP client of Qampus (norm 5.5, Annex H), exposed to every portal as
// `shell/apiClient`. It is the only code that knows the gateway origin, attaches the token,
// generates one X-Correlation-Id per request, enforces the per-request timeout, ends the
// session on 401 and turns every failure into an ApiError whose message was decided in one
// place (errors.ts). `download` returns binaries (the certificate PDF) the same way. Portals
// pass relative paths such as `/api/v1/catalog/subjects`.

import { config } from "../config";
import { session } from "../auth/session";
import { ApiError } from "./errors";

export const DEFAULT_TIMEOUT_MS = 10_000;

export interface RequestOptions {
  /** Required by every operation that creates (5.3.8): 8 to 128 characters, reused on retry. */
  idempotencyKey?: string;
  /** Per-request budget; the default is the annex's 10 s. */
  timeoutMs?: number;
  /** Lets a view cancel a request a newer one replaces (Annex H). */
  signal?: AbortSignal;
  /** Extra query parameters, appended URL-encoded; undefined values are skipped. */
  query?: Record<string, string | number | boolean | undefined>;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** A binary answer (a certificate's PDF, EN-14) with the headers a view may show. */
export interface Download {
  blob: Blob;
  contentType: string;
  /** The file name of Content-Disposition, when the service gives one. */
  filename?: string;
  headers: Headers;
}

function filenameOf(disposition: string | null): string | undefined {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition ?? "");
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function newCorrelationId(): string {
  return crypto.randomUUID();
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  if (!path.startsWith("/")) {
    throw new Error(`apiClient expects a relative path starting with "/", got "${path}"`);
  }
  const url = new URL(path, config.gatewayUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(method: Method, path: string, body?: unknown, options: RequestOptions = {}, accept = "application/json"): Promise<T> {
  const correlationId = newCorrelationId();
  const headers = new Headers({ Accept: accept, "X-Correlation-Id": correlationId });
  const token = session.token();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  options.signal?.addEventListener("abort", () => controller.abort(options.signal?.reason), { once: true });

  const url = buildUrl(path, options.query); // throws on an absolute URL, before any network call
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    const timedOut = controller.signal.aborted && controller.signal.reason instanceof DOMException && controller.signal.reason.name === "TimeoutError";
    if (controller.signal.aborted && !timedOut) throw cause;
    throw new ApiError(0, timedOut ? "TIMEOUT" : "NETWORK", correlationId, "");
  } finally {
    clearTimeout(timeout);
  }

  if (response.ok && accept !== "application/json") {
    const download: Download = {
      blob: await response.blob(),
      contentType: response.headers.get("Content-Type") ?? accept,
      headers: response.headers,
      ...(filenameOf(response.headers.get("Content-Disposition")) ? { filename: filenameOf(response.headers.get("Content-Disposition"))! } : {}),
    };
    return download as T;
  }
  const parsed = await parseBody(response);
  if (response.ok) return parsed as T;

  const error = ApiError.fromEnvelope(response.status, parsed, response.headers.get("X-Correlation-Id") ?? correlationId);
  if (response.status === 401) session.clear();
  throw error;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  del: <T = undefined>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
  /** GET of a binary resource (`Accept` defaults to PDF); errors still come as the JSON envelope. */
  download: (path: string, options?: RequestOptions & { accept?: string }) =>
    request<Download>("GET", path, undefined, options, options?.accept ?? "application/pdf"),
};

export type ApiClient = typeof apiClient;
