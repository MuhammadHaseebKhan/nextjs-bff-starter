import type { NextRequest } from "next/server";
import { authorize, findEvent, localeOf, toUpstreamEventDetail } from "@/mock-upstream/handler";

export async function GET(request: NextRequest, ctx: RouteContext<"/mock-upstream/events/[id]">) {
  const denied = authorize(request);
  if (denied) return denied;

  const { id } = await ctx.params;
  const event = findEvent(id);
  if (!event) return Response.json({ error: "not_found" }, { status: 404 });

  return Response.json(toUpstreamEventDetail(event, localeOf(request)));
}
