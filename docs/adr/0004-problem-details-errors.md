# 4. Return RFC 9457 problem details, and log the real cause server-side

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

Upstream failures carry information the browser should not see: status codes that reveal an auth
problem with the BFF's own key, validation errors that expose the upstream schema, internal hostnames
in network errors. But users and support still need to correlate a failure with logs.

## Decision

- Every BFF error response is `application/problem+json` (RFC 9457): `type`, `title`, `status`,
  optional `detail`, plus a `requestId`.
- Upstream failures are mapped to a small set of client-facing outcomes: `404` not found, `504`
  timed out, `502` unavailable. Everything else is a `500`.
- The full error, including the upstream status, kind and cause, is logged server-side as one
  redacted JSON line with the same `requestId` (`src/server/http/handle-route-error.ts`).
- A proxy (`src/proxy.ts`) assigns or reuses an `x-request-id` per request, forwards it upstream,
  and returns it in the response headers.

## Consequences

- The client contract for errors is uniform and documented, and `detail` is always safe to show.
- A user-reported request id finds the full server-side story in the logs.
- Logs are redacted by key name (tokens, cookies, API keys, email, phone) and emails are masked in
  free text, so the logging layer is safe to point at a shared log pipeline.
