# 1. Use Next.js route handlers as a Backend-for-Frontend

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

The UI needs data from an upstream API that requires a credential (an API key). Calling the upstream
directly from the browser would mean shipping that credential in the client bundle, coupling the UI to
the upstream's response shapes, and duplicating cross-cutting concerns (locale, retries, error
handling) in every component.

## Decision

The browser only ever calls this app. Two paths reach the upstream, and both go through a single
server-only client (`src/server/upstream/client.ts`):

- **Server Components** call the service layer (`src/server/events.ts`) directly during rendering.
- **Client Components** call BFF route handlers under `/api/*`, which call the same service layer.

The client injects the API key, applies a timeout, forwards locale and request id, validates every
response with zod, and turns every failure into a typed `UpstreamError`. `import "server-only"` makes
it a build error to import any of this from client code.

Upstream response shapes are mapped to the BFF's own contract (`src/domain/events.ts`) in one place,
so the UI never sees upstream field names.

## Consequences

- The API key never leaves the server. There is no `NEXT_PUBLIC_` variable to leak.
- An upstream schema change is a one-file fix, and an invalid upstream payload fails fast with a
  clear error instead of rendering `undefined`.
- Every browser request now has an extra hop. That is acceptable for this use case. Responses that
  can be shared between users could be cached with `"use cache"` in the service layer later.
- No generic `/api/[...path]` passthrough: each route is explicit, so the BFF cannot be used as an
  open proxy, and each route validates its own input.
