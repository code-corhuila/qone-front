import { ApiError, messageFor } from "./errors";

// The one place that decides what a person reads for each HTTP status (norm 5.5, Annex H).
describe("messageFor", () => {
  it.each([
    [0, "TIMEOUT", "The request took too long. Check your connection and try again."],
    [0, "NETWORK", "Could not reach Qampus. Check your connection and try again."],
    [400, "VALIDATION_ERROR", "Some fields are not valid. Review the form and try again."],
    [401, "UNAUTHORIZED", "Your session has ended. Sign in again."],
    [403, "FORBIDDEN", "You do not have permission for this action."],
    [404, "NOT_FOUND", "We could not find what you asked for."],
    [422, "INVALID_STATUS_TRANSITION", "This action is no longer possible in the current state."],
    [422, "BUSINESS_RULE_VIOLATION", "A rule of the university prevents this action."],
    [429, "TOO_MANY_REQUESTS", "Too many requests. Wait a moment and try again."],
    [503, "SERVICE_UNAVAILABLE", "This part of Qampus is not available right now. Try again later."],
    [500, "INTERNAL_ERROR", "Something went wrong on our side. Try again later."],
  ])("maps %i %s", (status, code, expected) => {
    expect(messageFor(status, code)).toBe(expected);
  });

  it("falls back to the generic message for an unknown status", () => {
    expect(messageFor(418, "I_AM_A_TEAPOT")).toBe("Something went wrong on our side. Try again later.");
  });
});

describe("ApiError", () => {
  it("is built from the common envelope and keeps the traceId for the person", () => {
    const error = ApiError.fromEnvelope(422, {
      error: "BUSINESS_RULE_VIOLATION",
      message: "INV-ENR-001: the student already has an active enrollment in this subject",
      traceId: "7c1f4a2e-0b7d-4a5f-9a1e-3d2c1b0a9f8e",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(422);
    expect(error.code).toBe("BUSINESS_RULE_VIOLATION");
    expect(error.traceId).toBe("7c1f4a2e-0b7d-4a5f-9a1e-3d2c1b0a9f8e");
    expect(error.serverMessage).toContain("INV-ENR-001");
    expect(error.message).toBe("A rule of the university prevents this action.");
    expect(error.details).toEqual([]);
  });

  it("keeps the field details of a validation error", () => {
    const error = ApiError.fromEnvelope(400, {
      error: "VALIDATION_ERROR",
      message: "the request has invalid fields",
      details: [{ field: "Idempotency-Key", message: "header required, 8 to 128 characters" }],
      traceId: "t-1",
    });

    expect(error.details).toEqual([{ field: "Idempotency-Key", message: "header required, 8 to 128 characters" }]);
    expect(error.fieldMessage("Idempotency-Key")).toBe("header required, 8 to 128 characters");
    expect(error.fieldMessage("other")).toBeUndefined();
  });

  it("tolerates a body that is not the envelope (for example an HTML page from a proxy)", () => {
    const error = ApiError.fromEnvelope(502, undefined, "corr-9");

    expect(error.status).toBe(502);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.traceId).toBe("corr-9");
    expect(error.message).toBe("Something went wrong on our side. Try again later.");
  });
});
