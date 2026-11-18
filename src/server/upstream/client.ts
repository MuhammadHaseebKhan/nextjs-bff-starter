import "server-only";
import type { z } from "zod";
import { getServerEnv } from "@/server/env";
import { classifyStatus, UpstreamError } from "./errors";

export type UpstreamRequest<T> = {
  /** Path relative to UPSTREAM_API_URL, e.g. `/events`. */
  path: string;
  /** Response schema. The upstream is untrusted input, so every response is validated. */
  schema: z.ZodType<T>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  /** Forwarded as Accept-Language so the upstream can localise its response. */
  locale?: string;
  requestId?: string;
  signal?: AbortSignal;
};

/**
 * The only way the app talks to the upstream API.
 *
 * - Injects the API key server-side (this module cannot be imported by client code).
 * - Applies a timeout to every call.
 * - Validates the response shape and turns every failure into an `UpstreamError`.
 */
export async function upstreamFetch<T>(request: UpstreamRequest<T>): Promise<T> {
  const env = getServerEnv();
  const url = buildUrl(env.UPSTREAM_API_URL, request.path, request.query);

  const headers = new Headers({
    Accept: "application/json",
    "X-API-Key": env.UPSTREAM_API_KEY,
  });
  if (request.locale) headers.set("Accept-Language", request.locale);
  if (request.requestId) headers.set("X-Request-Id", request.requestId);
  if (request.body !== undefined) headers.set("Content-Type", "application/json");

  const timeout = AbortSignal.timeout(env.UPSTREAM_TIMEOUT_MS);
  const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method ?? "GET",
      headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      signal,
    });
  } catch (error) {
    if (timeout.aborted) {
      throw new UpstreamError("timeout", `Upstream timed out after ${env.UPSTREAM_TIMEOUT_MS}ms`, undefined, {
        cause: error,
      });
    }
    throw new UpstreamError("network", "Upstream is unreachable", undefined, { cause: error });
  }

  if (!response.ok) {
    throw new UpstreamError(classifyStatus(response.status), `Upstream responded ${response.status}`, response.status);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new UpstreamError("bad_response", "Upstream returned invalid JSON", response.status, { cause: error });
  }

  const parsed = request.schema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError("bad_response", "Upstream response failed validation", response.status, {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

function buildUrl(base: string, path: string, query?: UpstreamRequest<unknown>["query"]): URL {
  const url = new URL(base.replace(/\/$/, "") + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}
