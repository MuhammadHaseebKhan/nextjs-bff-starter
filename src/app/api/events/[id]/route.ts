import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";
import { getEvent } from "@/server/events";
import { problemResponse, toProblemResponse } from "@/server/http/problem";

const ID_PATTERN = /^evt_\d{4}$/;

export async function GET(request: NextRequest, ctx: RouteContext<"/api/events/[id]">) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return problemResponse({ status: 404, title: "Not found" });
  }

  const locale = resolveLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  try {
    return Response.json(await getEvent(id, { locale, signal: request.signal }));
  } catch (error) {
    return toProblemResponse(error);
  }
}
