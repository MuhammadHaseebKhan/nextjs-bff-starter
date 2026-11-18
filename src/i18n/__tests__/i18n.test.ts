import { describe, expect, it } from "vitest";
import { directionOf, isLocale, resolveLocale } from "../config";
import { getDictionary } from "../dictionaries";
import { formatPrice } from "../format";

describe("locale config", () => {
  it("accepts supported locales only", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("falls back to English for unknown or missing values", () => {
    expect(resolveLocale("ar")).toBe("ar");
    expect(resolveLocale("de")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
  });

  it("uses right-to-left for Arabic", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });
});

describe("dictionaries", () => {
  it("pluralises English counts", () => {
    const t = getDictionary("en");
    expect(t.resultsCount(1)).toBe("1 event");
    expect(t.resultsCount(3)).toBe("3 events");
  });

  it("uses Arabic plural forms and digits", () => {
    const t = getDictionary("ar");
    expect(t.resultsCount(0)).toBe("لا توجد فعاليات");
    expect(t.resultsCount(1)).toBe("فعالية واحدة");
    expect(t.resultsCount(2)).toBe("فعاليتان");
    expect(t.resultsCount(6)).toBe("٦ فعاليات");
    expect(t.resultsCount(11)).toBe("١١ فعالية");
  });

  it("has the same keys in every language", () => {
    expect(Object.keys(getDictionary("ar")).sort()).toEqual(Object.keys(getDictionary("en")).sort());
  });
});

describe("formatPrice", () => {
  it("formats per locale", () => {
    expect(formatPrice({ amount: 45, currency: "USD" }, "en")).toBe("US$45");
  });
});
