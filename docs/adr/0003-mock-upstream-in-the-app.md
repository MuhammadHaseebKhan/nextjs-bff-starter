# 3. Ship a mock upstream inside the app

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

A starter that needs a real backend, API key and network access before `npm run dev` works is a
starter people don't run. Mocking at the `fetch` level (for example with MSW) would bypass the
behaviour this project exists to demonstrate: the API key header, `Accept-Language` forwarding,
timeouts, and mapping a different upstream shape.

## Decision

Serve a small mock upstream from the same Next.js app under `/mock-upstream/*`
(`src/mock-upstream/`). It:

- rejects requests without the correct `X-API-Key` (401),
- localises its response from `Accept-Language`,
- deliberately uses a different shape (snake_case, `data`/`meta` envelope) from the BFF contract.

`UPSTREAM_API_URL` points at it by default. Pointing it at a real API and setting
`ENABLE_MOCK_UPSTREAM=false` turns the mock off.

## Consequences

- `npm install && npm run dev` works with zero external services.
- The real HTTP path is exercised end to end, including the auth failure path.
- The mock must be disabled in production. It returns 404 when `ENABLE_MOCK_UPSTREAM=false`.
- Unit tests still stub `fetch` directly, because they test the client in isolation.
