import { setLocale } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { en: "English", ar: "العربية" };

/** A plain form posting to a Server Action: works without client JavaScript. */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  return (
    <form action={setLocale} aria-label={label} className="flex gap-1 rounded-full border border-black/10 p-1 dark:border-white/15">
      {locales.map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          lang={locale}
          aria-pressed={locale === current}
          className="rounded-full px-3 py-1 text-sm transition-colors aria-pressed:bg-foreground aria-pressed:text-background hover:bg-black/5 dark:hover:bg-white/10"
        >
          {labels[locale]}
        </button>
      ))}
    </form>
  );
}
