import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatEventDate, formatPrice } from "@/i18n/format";
import { getLocale } from "@/i18n/server";
import { getEvent } from "@/server/events";
import { UpstreamError } from "@/server/upstream/errors";

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-12">
      <Link href="/" className="w-fit text-sm underline underline-offset-4">
        <span aria-hidden className="inline-block rtl:rotate-180">
          ←
        </span>{" "}
        {t.backToEvents}
      </Link>
      <Suspense fallback={<div aria-hidden className="h-72 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />}>
        <EventDetails id={id} locale={locale} />
      </Suspense>
    </main>
  );
}

async function EventDetails({ id, locale }: { id: string; locale: Locale }) {
  const t = getDictionary(locale);
  const event = await loadEvent(id, locale);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium dark:bg-white/10">
          {t.categories[event.category]}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-lg">{event.description}</p>
      </header>

      <dl className="grid gap-4 rounded-2xl border border-black/10 p-5 sm:grid-cols-3 dark:border-white/15">
        <div>
          <dt className="text-sm text-black/60 dark:text-white/60">{t.date}</dt>
          <dd>
            <time dateTime={event.startsAt}>{formatEventDate(event.startsAt, locale)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-black/60 dark:text-white/60">{t.venue}</dt>
          <dd>
            {event.venue}
            {t.listSeparator}
            {event.city}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-black/60 dark:text-white/60">{t.from}</dt>
          <dd>{event.price.amount === 0 ? t.free : formatPrice(event.price, locale)}</dd>
        </div>
      </dl>
    </article>
  );
}

async function loadEvent(id: string, locale: Locale) {
  try {
    return await getEvent(id, { locale });
  } catch (error) {
    if (error instanceof UpstreamError && error.kind === "not_found") notFound();
    throw error;
  }
}
