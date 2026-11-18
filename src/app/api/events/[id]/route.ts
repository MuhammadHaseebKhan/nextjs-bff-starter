import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";
import { REQUEST_ID_HEADER } from "@/proxy";
import { getEvent } from "@/server/events";
import { handleRouteError } from "@/server/http/handle-route-error";
import { problemResponse } from "@/server/http/problem";

const ID_PATTERN = /^evt_\d{4}$/;

export async function GET(request: NextRequest, ctx: RouteContext<"/api/events/[id]">) {
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? undefined;
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return problemResponse({ status: 404, title: "Not found", requestId });
  }

  const locale = resolveLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  try {
    return Response.json(await getEvent(id, { locale, requestId, signal: request.signal }));
  } catch (error) {
    return handleRouteError(error, { route: "GET /api/events/[id]", requestId });
  }
}
