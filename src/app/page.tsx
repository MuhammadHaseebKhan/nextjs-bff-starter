import { Suspense } from "react";
import { EventGridSkeleton } from "@/components/event-grid-skeleton";
import { EventSearch } from "@/components/event-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { listEvents } from "@/server/events";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t.appName}</h1>
          <p className="text-black/60 dark:text-white/60">{t.tagline}</p>
        </div>
        <LanguageSwitcher current={locale} label={t.language} />
      </header>
      <Suspense fallback={<EventGridSkeleton />}>
        <EventResults locale={locale} />
      </Suspense>
    </main>
  );
}

async function EventResults({ locale }: { locale: Locale }) {
  // Server components call the upstream client directly; only the browser goes through /api.
  const initial = await listEvents({}, { locale });
  // Keyed by locale so switching language resets search state to the new server-rendered list.
  return <EventSearch key={locale} initial={initial} locale={locale} />;
}
