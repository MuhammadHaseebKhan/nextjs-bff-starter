import type { NextRequest } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";
import { REQUEST_ID_HEADER } from "@/proxy";
import { listEvents } from "@/server/events";
import { handleRouteError } from "@/server/http/handle-route-error";
import { problemResponse } from "@/server/http/problem";

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? undefined;
  const query = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) {
    return problemResponse({ status: 400, title: "Invalid query", detail: query.error.issues[0]?.message, requestId });
  }

  const locale = resolveLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  try {
    const events = await listEvents(query.data, { locale, requestId, signal: request.signal });
    return Response.json(events);
  } catch (error) {
    return handleRouteError(error, { route: "GET /api/events", requestId });
  }
}
