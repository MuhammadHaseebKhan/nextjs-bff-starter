// @vitest-environment node
import { describe, expect, it } from "vitest";
import { UpstreamError, type UpstreamErrorKind } from "@/server/upstream/errors";
import { toProblemResponse } from "../problem";

describe("toProblemResponse", () => {
  it.each<[UpstreamErrorKind, number]>([
    ["not_found", 404],
    ["timeout", 504],
    ["network", 502],
    ["unauthorized", 502],
    ["bad_response", 502],
    ["upstream_error", 502],
  ])("maps %s to HTTP %i", (kind, status) => {
    const response = toProblemResponse(new UpstreamError(kind, "boom"));
    expect(response.status).toBe(status);
    expect(response.headers.get("Content-Type")).toBe("application/problem+json");
  });

  it("does not leak upstream details to the client", async () => {
    const response = toProblemResponse(new UpstreamError("unauthorized", "Upstream responded 401 for key test-key", 401));
    const body = await response.text();
    expect(body).not.toMatch(/401|key/i);
  });

  it("maps unknown errors to 500 and includes the request id", async () => {
    const response = toProblemResponse(new Error("database exploded"), "req-42");
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ type: "about:blank", status: 500, title: "Internal error", requestId: "req-42" });
  });
});
