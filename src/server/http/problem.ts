import "server-only";
import type { Problem } from "@/domain/events";
import { UpstreamError } from "@/server/upstream/errors";

export function problemResponse(problem: Omit<Problem, "type"> & { type?: string }): Response {
  return Response.json(
    { type: "about:blank", ...problem } satisfies Problem,
    { status: problem.status, headers: { "Content-Type": "application/problem+json" } },
  );
}

/**
 * Maps any thrown error to a client-safe problem response.
 *
 * Upstream details (status codes, auth failures, validation errors) are deliberately not
 * echoed to the browser: the client only learns whether to retry, not why the upstream failed.
 */
export function toProblemResponse(error: unknown, requestId?: string): Response {
  if (error instanceof UpstreamError) {
    switch (error.kind) {
      case "not_found":
        return problemResponse({ status: 404, title: "Not found", requestId });
      case "timeout":
        return problemResponse({ status: 504, title: "Upstream timed out", detail: "Please try again.", requestId });
      default:
        return problemResponse({
          status: 502,
          title: "Upstream unavailable",
          detail: "Please try again later.",
          requestId,
        });
    }
  }
  return problemResponse({ status: 500, title: "Internal error", requestId });
}
