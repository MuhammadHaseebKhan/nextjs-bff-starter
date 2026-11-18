import "server-only";
import { mockEvents, type MockEvent } from "./fixtures";

/**
 * A stand-in for a real upstream API, so the starter runs with zero external services.
 * It enforces the API key and honours Accept-Language, which lets the BFF's
 * key injection and locale forwarding be exercised end to end.
 */

type Locale = "en" | "ar";

export function isMockUpstreamEnabled(): boolean {
  return process.env.ENABLE_MOCK_UPSTREAM !== "false";
}

export function authorize(request: Request): Response | undefined {
  if (!isMockUpstreamEnabled()) return new Response(null, { status: 404 });
  if (request.headers.get("x-api-key") !== process.env.UPSTREAM_API_KEY) {
    return Response.json({ error: "invalid_api_key" }, { status: 401 });
  }
  return undefined;
}

export function localeOf(request: Request): Locale {
  return request.headers.get("accept-language")?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function toUpstreamEvent(event: MockEvent, locale: Locale) {
  return {
    id: event.id,
    title: event.title[locale],
    city: event.city[locale],
    category: event.category,
    starts_at: event.startsAt,
    price_from: event.price,
  };
}

export function toUpstreamEventDetail(event: MockEvent, locale: Locale) {
  return {
    ...toUpstreamEvent(event, locale),
    description: event.description[locale],
    venue_name: event.venue[locale],
  };
}

const categoryNames: Record<MockEvent["category"], string[]> = {
  music: ["music", "موسيقى"],
  tech: ["tech", "تقنية"],
  food: ["food", "طعام"],
  art: ["art", "فن"],
  sports: ["sports", "رياضة"],
};

export function searchEvents(q: string | null): MockEvent[] {
  const needle = q?.trim().toLowerCase();
  if (!needle) return mockEvents;
  return mockEvents.filter((event) =>
    [event.title.en, event.title.ar, event.city.en, event.city.ar, ...categoryNames[event.category]].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
}

export function findEvent(id: string): MockEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}
