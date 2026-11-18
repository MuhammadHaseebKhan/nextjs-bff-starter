import Link from "next/link";
import type { EventSummary } from "@/domain/events";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatEventDate, formatPrice } from "@/i18n/format";

export function EventCard({ event, locale }: { event: EventSummary; locale: Locale }) {
  const t = getDictionary(locale);
  const price = event.price.amount === 0 ? t.free : `${t.from} ${formatPrice(event.price, locale)}`;

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="flex h-full flex-col gap-2 rounded-2xl border border-black/10 p-5 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
      >
        <span className="w-fit rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium dark:bg-white/10">
          {t.categories[event.category]}
        </span>
        <h3 className="text-lg font-semibold leading-snug">{event.title}</h3>
        <p className="text-sm text-black/60 dark:text-white/60">
          {event.city} · <time dateTime={event.startsAt}>{formatEventDate(event.startsAt, locale)}</time>
        </p>
        <p className="mt-auto pt-2 text-sm font-medium">{price}</p>
      </Link>
    </li>
  );
}
