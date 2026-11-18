"use client";

import { useEffect, useRef, useState } from "react";
import type { EventList, Problem } from "@/domain/events";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { EventCard } from "./event-card";

const DEBOUNCE_MS = 300;

type State =
  | { status: "idle" | "loading"; events: EventList }
  | { status: "error"; events: EventList; problem: Problem };

/**
 * Client-side search through the BFF (`/api/events`), never the upstream directly.
 * Server-rendered results seed the first paint; typing debounces and cancels stale requests.
 */
export function EventSearch({ initial, locale }: { initial: EventList; locale: Locale }) {
  const t = getDictionary(locale);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle", events: initial });
  const [retryCount, setRetryCount] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState((previous) => ({ status: "loading", events: previous.events }));
      try {
        const params = new URLSearchParams(query.trim() ? { q: query.trim() } : {});
        const response = await fetch(`/api/events?${params}`, { signal: controller.signal });
        if (!response.ok) {
          const problem = (await response.json()) as Problem;
          setState((previous) => ({ status: "error", events: previous.events, problem }));
          return;
        }
        setState({ status: "idle", events: (await response.json()) as EventList });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          status: "error",
          events: previous.events,
          problem: { type: "about:blank", status: 0, title: t.errors.title, detail: String(error) },
        }));
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, retryCount, t.errors.title]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="event-search" className="text-sm font-medium">
          {t.searchLabel}
        </label>
        <input
          id="event-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          maxLength={100}
          className="h-11 rounded-xl border border-black/15 bg-transparent px-4 outline-none focus:border-foreground dark:border-white/20"
        />
      </div>

      <p role="status" aria-live="polite" className="text-sm text-black/60 dark:text-white/60">
        {state.status === "loading" ? t.loading : t.resultsCount(state.events.total)}
      </p>

      {state.status === "error" && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-500/40 p-4 text-sm">
          <span>
            <strong>{t.errors.title}.</strong> {state.problem.detail}
          </span>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="rounded-full border border-current px-3 py-1"
          >
            {t.errors.retry}
          </button>
        </div>
      )}

      {state.events.items.length === 0 ? (
        <p>{t.noResults}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={state.status === "loading"}>
          {state.events.items.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </ul>
      )}
    </section>
  );
}
