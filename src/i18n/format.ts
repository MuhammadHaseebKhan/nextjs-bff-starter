import type { Locale } from "./config";

const intlLocale: Record<Locale, string> = { en: "en-GB", ar: "ar-EG" };

export function formatEventDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatPrice(price: { amount: number; currency: string }, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
}
