// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const upstreamEvent = {
  id: "evt_1001",
  title: "Open-Air Jazz Night",
  city: "Dubai",
  category: "music",
  starts_at: "2027-01-15T19:30:00Z",
  price_from: { amount: 45, currency: "USD" },
};

beforeEach(() => {
  vi.stubEnv("UPSTREAM_API_URL", "https://upstream.test");
  vi.stubEnv("UPSTREAM_API_KEY", "test-key");
  vi.resetModules();
});

describe("events service", () => {
  it("maps the upstream list to the BFF contract", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: [upstreamEvent], meta: { total: 1 } })));
    const { listEvents } = await import("../events");

    await expect(listEvents({ q: "jazz" })).resolves.toEqual({
      total: 1,
      items: [
        {
          id: "evt_1001",
          title: "Open-Air Jazz Night",
          city: "Dubai",
          category: "music",
          startsAt: "2027-01-15T19:30:00Z",
          price: { amount: 45, currency: "USD" },
        },
      ],
    });
  });

  it("maps event details and encodes the id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ ...upstreamEvent, description: "Live jazz.", venue_name: "Amphitheatre" }));
    vi.stubGlobal("fetch", fetchMock);
    const { getEvent } = await import("../events");

    const event = await getEvent("evt_1001");

    expect(event).toMatchObject({ id: "evt_1001", venue: "Amphitheatre", description: "Live jazz." });
    expect(event).not.toHaveProperty("venue_name");
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://upstream.test/events/evt_1001");
  });

  it("rejects upstream payloads with an unknown category", async () => {
    const bad = { ...upstreamEvent, category: "politics" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: [bad], meta: { total: 1 } })));
    const { listEvents } = await import("../events");

    await expect(listEvents({})).rejects.toMatchObject({ kind: "bad_response" });
  });
});
