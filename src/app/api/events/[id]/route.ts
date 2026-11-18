import type { NextRequest } from "next/server";
import { getEvent } from "@/server/events";
import { problemResponse, toProblemResponse } from "@/server/http/problem";

const ID_PATTERN = /^evt_[0-9]{4}$/;

export async function GET(request: NextRequest, ctx: RouteContext<"/api/events/[id]">) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) {
    return problemResponse({ status: 404, title: "Not found" });
  }

  try {
    return Response.json(await getEvent(id, { signal: request.signal }));
  } catch (error) {
    return toProblemResponse(error);
  }
}
