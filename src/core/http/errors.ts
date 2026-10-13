// The common error envelope of the norm (07-api/contracts/openapi/_shared.yaml) as the
// container sees it, and the ONE place that decides the message a person reads for each
// status (norm 5.5, Annex H). Portals show `error.message` and `error.traceId`; they never
// map statuses themselves.

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_STATUS_TRANSITION"
  | "BUSINESS_RULE_VIOLATION"
  | "TOO_MANY_REQUESTS"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR"
  | "TIMEOUT"
  | "NETWORK";

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorEnvelope {
  error: string;
  message: string;
  details?: ErrorDetail[];
  traceId: string;
}

const MESSAGES: Record<string, string> = {
  TIMEOUT: "The request took too long. Check your connection and try again.",
  NETWORK: "Could not reach Qampus. Check your connection and try again.",
  VALIDATION_ERROR: "Some fields are not valid. Review the form and try again.",
  UNAUTHORIZED: "Your session has ended. Sign in again.",
  FORBIDDEN: "You do not have permission for this action.",
  NOT_FOUND: "We could not find what you asked for.",
  INVALID_STATUS_TRANSITION: "This action is no longer possible in the current state.",
  BUSINESS_RULE_VIOLATION: "A rule of the university prevents this action.",
  TOO_MANY_REQUESTS: "Too many requests. Wait a moment and try again.",
  SERVICE_UNAVAILABLE: "This part of Qampus is not available right now. Try again later.",
};

const GENERIC = "Something went wrong on our side. Try again later.";

/** The message a person reads for a status and code. Decided here and nowhere else. */
export function messageFor(status: number, code: string): string {
  if (status === 0) return MESSAGES[code] ?? MESSAGES["NETWORK"] ?? GENERIC;
  return MESSAGES[code] ?? GENERIC;
}

function isEnvelope(body: unknown): body is ErrorEnvelope {
  return typeof body === "object" && body !== null && typeof (body as ErrorEnvelope).error === "string" && typeof (body as ErrorEnvelope).message === "string";
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | string;
  readonly traceId: string;
  readonly serverMessage: string;
  readonly details: ErrorDetail[];

  constructor(status: number, code: string, traceId: string, serverMessage: string, details: ErrorDetail[] = []) {
    super(messageFor(status, code));
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.serverMessage = serverMessage;
    this.details = details;
  }

  /** Builds the error from a response body; a body that is not the envelope becomes INTERNAL_ERROR with the request's correlation id. */
  static fromEnvelope(status: number, body: unknown, correlationId = ""): ApiError {
    if (isEnvelope(body)) {
      return new ApiError(status, body.error, body.traceId || correlationId, body.message, body.details ?? []);
    }
    return new ApiError(status, "INTERNAL_ERROR", correlationId, "");
  }

  /** The server's message for one field of a validation error, to render beside that field (Annex H). */
  fieldMessage(field: string): string | undefined {
    return this.details.find((d) => d.field === field)?.message;
  }
}
