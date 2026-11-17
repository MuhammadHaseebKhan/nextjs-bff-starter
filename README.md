# nextjs-bff-starter

A production-minded Next.js (App Router) starter that uses route handlers as a **Backend-for-Frontend (BFF)**: the browser only talks to the Next.js server, and the server talks to upstream APIs with credentials the browser never sees.

> 🚧 Work in progress. Features land incrementally; see the roadmap below.

## Why a BFF?

- **Secrets stay on the server.** Upstream API keys are injected server-side and are never shipped in the client bundle.
- **One place for cross-cutting concerns:** auth headers, locale, error mapping, logging, and caching all live in a single proxy layer.
- **A stable contract for the UI.** The frontend depends on BFF response shapes, not on whatever the upstream returns.

## Roadmap

- [x] Next.js 16 + TypeScript + Tailwind scaffold
- [x] CI: lint, type-check, build, secret scanning (gitleaks)
- [ ] Typed upstream client with server-only API-key injection
- [ ] Route-handler proxy with error normalisation
- [ ] Mock upstream (MSW) so the project runs with zero external services
- [ ] i18n (English / Arabic) with RTL layout
- [ ] Locale persistence across full-page redirects (e.g. hosted checkout)
- [ ] Unit tests (Vitest + React Testing Library)
- [ ] Observability: error tracking with PII scrubbing
- [ ] Architecture decision records (ADRs)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## License

MIT
