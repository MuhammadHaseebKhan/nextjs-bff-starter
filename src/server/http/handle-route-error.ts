import "server-only";
import { log } from "@/server/log";
import { UpstreamError } from "@/server/upstream/errors";
import { toProblemResponse } from "./problem";

/**
 * Logs the full failure server-side (with the request id), then returns the client-safe problem.
 * The browser gets "502, try again"; the logs get the upstream status and cause.
 */
export function handleRouteError(error: unknown, context: { route: string; requestId?: string }): Response {
  if (error instanceof UpstreamError) {
    const level = error.kind === "not_found" ? "info" : "warn";
    log[level]("upstream request failed", { ...context, kind: error.kind, status: error.status, error });
  } else {
    log.error("unhandled route error", { ...context, error });
  }
  return toProblemResponse(error, context.requestId);
}
