# 2. Keep the locale in a cookie, not the URL or client state

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

The app supports English and Arabic (right-to-left). The locale has to be known in four places:

1. The root layout, to set `<html lang dir>` before first paint.
2. Server Components, to render translated copy.
3. Route handlers, to forward `Accept-Language` to the upstream.
4. After a **full-page redirect**, such as returning from a hosted checkout, an OAuth provider or a
   payment gateway. Any locale held in React state or a client store is lost at that point, and the
   user lands back in the default language.

## Decision

Store the locale in a first-party `locale` cookie (`SameSite=Lax`, one year), written by a Server
Action (`src/i18n/actions.ts`). The language switcher is a plain `<form>`, so it works before
hydration and without JavaScript.

Server code reads it with `cookies()`, and route handlers read it from `request.cookies`. Unknown
values fall back to English.

## Alternatives considered

- **Locale in the URL (`/ar/...`):** best for SEO of public content, but every link and redirect
  target has to carry the prefix. Third-party redirect URLs are often configured once and can't.
- **`localStorage` / client state:** not available during server rendering, so the first paint is in
  the wrong language and direction. It also does not reach route handlers.

## Consequences

- The locale survives full-page redirects with no rehydration code.
- Reading a cookie in the root layout makes every route dynamic (`export const instant = false`).
  Data-dependent sections stream inside `<Suspense>`, so the shell still renders immediately.
- Search engines see only the default language. If public SEO in Arabic matters, add URL prefixes on
  top of this and keep the cookie as the user's preference.
