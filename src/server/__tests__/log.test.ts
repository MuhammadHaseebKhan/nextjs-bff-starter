// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { log, redact } from "../log";

describe("redact", () => {
  it("redacts sensitive keys at any depth", () => {
    expect(
      redact({
        user: { email: "a@b.co", name: "Sam" },
        headers: { authorization: "Bearer abc", "X-API-Key": "k", accept: "json" },
        password: "hunter2",
      }),
    ).toEqual({
      user: { email: "[Redacted]", name: "Sam" },
      headers: { authorization: "[Redacted]", "X-API-Key": "[Redacted]", accept: "json" },
      password: "[Redacted]",
    });
  });

  it("masks email addresses inside free text and errors", () => {
    expect(redact("contact jane.doe+events@example.com today")).toBe("contact [email] today");
    expect(redact(new Error("no account for jane@example.com"))).toMatchObject({ message: "no account for [email]" });
  });

  it("stops at a maximum depth", () => {
    const deep = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    expect(JSON.stringify(redact(deep))).toContain("[Truncated]");
  });
});

describe("log", () => {
  it("writes one redacted JSON line", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    log.warn("upstream request failed", { requestId: "req-1", token: "abc123" });

    const line = JSON.parse(spy.mock.calls[0][0] as string);
    expect(line).toMatchObject({ level: "warn", message: "upstream request failed", requestId: "req-1", token: "[Redacted]" });
    expect(line.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
