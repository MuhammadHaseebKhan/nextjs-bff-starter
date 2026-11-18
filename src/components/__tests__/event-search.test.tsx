import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { EventList } from "@/domain/events";
import { EventSearch } from "../event-search";

vi.mock("next/link", () => ({
  default: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => <a href={href} {...props} />,
}));

const jazz = {
  id: "evt_1001",
  title: "Open-Air Jazz Night",
  city: "Dubai",
  category: "music" as const,
  startsAt: "2027-01-15T19:30:00Z",
  price: { amount: 45, currency: "USD" },
};
const meetup = { ...jazz, id: "evt_1002", title: "Frontend Architecture Meetup", category: "tech" as const };

const initial: EventList = { items: [jazz, meetup], total: 2 };

describe("EventSearch", () => {
  it("renders the server-provided results without fetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<EventSearch initial={initial} locale="en" />);

    expect(screen.getByRole("status")).toHaveTextContent("2 events");
    expect(screen.getByRole("link", { name: /Open-Air Jazz Night/ })).toHaveAttribute("href", "/events/evt_1001");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches through the BFF, not the upstream", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ items: [meetup], total: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<EventSearch initial={initial} locale="en" />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "tech");

    expect(await screen.findByText("1 event")).toBeInTheDocument();
    expect(screen.queryByText("Open-Air Jazz Night")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/events?q=tech");
  });

  it("shows the problem detail and retries on error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ type: "about:blank", status: 502, title: "Upstream unavailable", detail: "Please try again later." }, { status: 502 }),
      )
      .mockResolvedValueOnce(Response.json({ items: [jazz], total: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<EventSearch initial={initial} locale="en" />);
    await userEvent.type(screen.getByRole("searchbox"), "jazz");

    expect(await screen.findByRole("alert")).toHaveTextContent("Please try again later.");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("1 event")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders Arabic copy", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<EventSearch initial={initial} locale="ar" />);
    expect(screen.getByRole("status")).toHaveTextContent("فعاليتان");
  });
});
