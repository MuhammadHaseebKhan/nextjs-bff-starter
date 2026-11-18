import type { NextRequest } from "next/server";
import { z } from "zod";
import { listEvents } from "@/server/events";
import { problemResponse, toProblemResponse } from "@/server/http/problem";

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const query = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) {
    return problemResponse({ status: 400, title: "Invalid query", detail: query.error.issues[0]?.message });
  }

  try {
    const events = await listEvents(query.data, { signal: request.signal });
    return Response.json(events);
  } catch (error) {
    return toProblemResponse(error);
  }
}
