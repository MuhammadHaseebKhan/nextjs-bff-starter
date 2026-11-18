// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy, REQUEST_ID_HEADER } from "../proxy";

function forwardedRequestId(response: Response) {
  // NextResponse.next() encodes overridden request headers as x-middleware-request-* response headers.
  return response.headers.get(`x-middleware-request-${REQUEST_ID_HEADER}`);
}

describe("proxy", () => {
  it("generates a request id and exposes it on both the request and the response", () => {
    const response = proxy(new NextRequest("http://localhost/api/events"));

    const id = response.headers.get(REQUEST_ID_HEADER);
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(forwardedRequestId(response)).toBe(id);
  });

  it("reuses a valid incoming request id", () => {
    const request = new NextRequest("http://localhost/api/events", { headers: { [REQUEST_ID_HEADER]: "lb-trace-12345" } });
    expect(proxy(request).headers.get(REQUEST_ID_HEADER)).toBe("lb-trace-12345");
  });

  it("replaces an invalid incoming request id", () => {
    const request = new NextRequest("http://localhost/api/events", {
      headers: { [REQUEST_ID_HEADER]: "<script>alert(1)</script>" },
    });
    expect(proxy(request).headers.get(REQUEST_ID_HEADER)).not.toContain("<script>");
  });
});
