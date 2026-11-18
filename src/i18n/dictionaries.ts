import type { Locale } from "./config";

const en = {
  appName: "Events BFF Starter",
  tagline: "Next.js route handlers as a Backend-for-Frontend. The browser never sees the upstream API key.",
  searchLabel: "Search events",
  searchPlaceholder: "Search by name, city or category",
  resultsCount: (count: number) => (count === 1 ? "1 event" : `${count} events`),
  noResults: "No events match your search.",
  loading: "Searching…",
  free: "Free",
  from: "From",
  backToEvents: "Back to events",
  venue: "Venue",
  date: "Date",
  listSeparator: ", ",
  language: "Language",
  categories: { music: "Music", tech: "Tech", food: "Food", art: "Art", sports: "Sports" },
  errors: {
    title: "Something went wrong",
    retry: "Try again",
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  appName: "نموذج الفعاليات مع طبقة BFF",
  tagline: "معالجات المسارات في Next.js كطبقة خلفية للواجهة. المتصفح لا يرى مفتاح الواجهة البرمجية أبدًا.",
  searchLabel: "ابحث عن الفعاليات",
  searchPlaceholder: "ابحث بالاسم أو المدينة أو الفئة",
  resultsCount: (count: number) => {
    if (count === 0) return "لا توجد فعاليات";
    if (count === 1) return "فعالية واحدة";
    if (count === 2) return "فعاليتان";
    const digits = new Intl.NumberFormat("ar-EG").format(count);
    return count <= 10 ? `${digits} فعاليات` : `${digits} فعالية`;
  },
  noResults: "لا توجد فعاليات تطابق بحثك.",
  loading: "جارٍ البحث…",
  free: "مجاني",
  from: "ابتداءً من",
  backToEvents: "العودة إلى الفعاليات",
  venue: "المكان",
  date: "التاريخ",
  listSeparator: "، ",
  language: "اللغة",
  categories: { music: "موسيقى", tech: "تقنية", food: "طعام", art: "فن", sports: "رياضة" },
  errors: {
    title: "حدث خطأ ما",
    retry: "حاول مرة أخرى",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
