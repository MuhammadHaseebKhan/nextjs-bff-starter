import "server-only";
import { z } from "zod";
import type { EventDetail, EventList, EventSummary } from "@/domain/events";
import { upstreamFetch } from "@/server/upstream/client";

// Upstream shapes: snake_case and nested differently from the BFF contract on purpose.
// Only this file knows about them, so an upstream change is a one-file fix.
const upstreamEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  category: z.enum(["music", "tech", "food", "art", "sports"]),
  starts_at: z.iso.datetime(),
  price_from: z.object({ amount: z.number().nonnegative(), currency: z.string().length(3) }),
});

const upstreamEventDetailSchema = upstreamEventSchema.extend({
  description: z.string(),
  venue_name: z.string(),
});

const upstreamEventListSchema = z.object({
  data: z.array(upstreamEventSchema),
  meta: z.object({ total: z.number().int().nonnegative() }),
});

type UpstreamEvent = z.infer<typeof upstreamEventSchema>;

function toEventSummary(event: UpstreamEvent): EventSummary {
  return {
    id: event.id,
    title: event.title,
    city: event.city,
    category: event.category,
    startsAt: event.starts_at,
    price: event.price_from,
  };
}

type RequestContext = { locale?: string; requestId?: string; signal?: AbortSignal };

export async function listEvents(query: { q?: string }, context: RequestContext = {}): Promise<EventList> {
  const result = await upstreamFetch({
    path: "/events",
    query: { q: query.q },
    schema: upstreamEventListSchema,
    ...context,
  });
  return { items: result.data.map(toEventSummary), total: result.meta.total };
}

export async function getEvent(id: string, context: RequestContext = {}): Promise<EventDetail> {
  const event = await upstreamFetch({
    path: `/events/${encodeURIComponent(id)}`,
    schema: upstreamEventDetailSchema,
    ...context,
  });
  return { ...toEventSummary(event), description: event.description, venue: event.venue_name };
}
