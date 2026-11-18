import type { NextRequest } from "next/server";
import { authorize, localeOf, searchEvents, toUpstreamEvent } from "@/mock-upstream/handler";

export async function GET(request: NextRequest) {
  const denied = authorize(request);
  if (denied) return denied;

  const locale = localeOf(request);
  const events = searchEvents(request.nextUrl.searchParams.get("q"));
  return Response.json({
    data: events.map((event) => toUpstreamEvent(event, locale)),
    meta: { total: events.length },
  });
}
