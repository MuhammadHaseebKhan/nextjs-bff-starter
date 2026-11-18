/**
 * The BFF's public contract. The UI depends on these shapes only, never on the upstream's.
 * Safe to import from client components (no server-only code here).
 */

export type EventCategory = "music" | "tech" | "food" | "art" | "sports";

export type EventSummary = {
  id: string;
  title: string;
  city: string;
  category: EventCategory;
  startsAt: string;
  price: { amount: number; currency: string };
};

export type EventDetail = EventSummary & {
  description: string;
  venue: string;
};

export type EventList = {
  items: EventSummary[];
  total: number;
};

/** RFC 9457 problem details, the error shape every BFF route returns. */
export type Problem = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  requestId?: string;
};
