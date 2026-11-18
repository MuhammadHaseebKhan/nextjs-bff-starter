// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const schema = z.object({ ok: z.boolean() });

async function loadClient() {
  // env.ts caches the parsed environment, so each test gets a fresh module graph.
  vi.resetModules();
  return import("../client");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  vi.stubEnv("UPSTREAM_API_URL", "https://upstream.test/v1/");
  vi.stubEnv("UPSTREAM_API_KEY", "test-key");
  vi.stubEnv("UPSTREAM_TIMEOUT_MS", "50");
});

describe("upstreamFetch", () => {
  it("injects the API key and forwards locale and request id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { upstreamFetch } = await loadClient();

    await upstreamFetch({ path: "/events", query: { q: "jazz", empty: "", missing: undefined }, schema, locale: "ar", requestId: "req-1" });

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://upstream.test/v1/events?q=jazz");
    const headers = new Headers(init.headers);
    expect(headers.get("X-API-Key")).toBe("test-key");
    expect(headers.get("Accept-Language")).toBe("ar");
    expect(headers.get("X-Request-Id")).toBe("req-1");
  });

  it("returns the validated body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ ok: true, extra: "ignored" })));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).resolves.toEqual({ ok: true });
  });

  it.each([
    [404, "not_found"],
    [401, "unauthorized"],
    [403, "unauthorized"],
    [500, "upstream_error"],
  ])("classifies HTTP %i as %s", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, status)));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toMatchObject({ name: "UpstreamError", kind, status });
  });

  it("rejects responses that do not match the schema", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ ok: "yes" })));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toMatchObject({ kind: "bad_response" });
  });

  it("rejects invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toMatchObject({ kind: "bad_response" });
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toMatchObject({ kind: "network" });
  });

  it("times out slow upstreams", async () => {
    const hangUntilAborted = (_url: URL, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      });
    vi.stubGlobal("fetch", vi.fn(hangUntilAborted));
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toMatchObject({ kind: "timeout" });
  });

  it("fails loudly when the environment is invalid", async () => {
    vi.stubEnv("UPSTREAM_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn());
    const { upstreamFetch } = await loadClient();

    await expect(upstreamFetch({ path: "/x", schema })).rejects.toThrow(/UPSTREAM_API_KEY/);
  });
});
