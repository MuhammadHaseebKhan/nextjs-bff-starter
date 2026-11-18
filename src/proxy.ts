import { NextResponse, type NextRequest } from "next/server";

export const REQUEST_ID_HEADER = "x-request-id";

const VALID_REQUEST_ID = /^[\w-]{8,64}$/;

/**
 * Gives every request a correlation id: reused from an upstream proxy/load balancer when it
 * looks valid, generated otherwise. Route handlers log it and forward it upstream, and it is
 * echoed back to the client so a user-reported error can be traced end to end.
 */
export function proxy(request: NextRequest) {
  const incoming = request.headers.get(REQUEST_ID_HEADER);
  const requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : crypto.randomUUID();

  const headers = new Headers(request.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
