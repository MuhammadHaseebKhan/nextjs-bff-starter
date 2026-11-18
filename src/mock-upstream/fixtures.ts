// Fictional demo data for the mock upstream API.

type Localized = { en: string; ar: string };

export type MockEvent = {
  id: string;
  title: Localized;
  city: Localized;
  category: "music" | "tech" | "food" | "art" | "sports";
  startsAt: string;
  price: { amount: number; currency: string };
  description: Localized;
  venue: Localized;
};

export const mockEvents: MockEvent[] = [
  {
    id: "evt_1001",
    title: { en: "Open-Air Jazz Night", ar: "ليلة جاز في الهواء الطلق" },
    city: { en: "Dubai", ar: "دبي" },
    category: "music",
    startsAt: "2027-01-15T19:30:00Z",
    price: { amount: 45, currency: "USD" },
    description: {
      en: "An evening of live jazz under the stars with three local ensembles.",
      ar: "أمسية من موسيقى الجاز الحية تحت النجوم مع ثلاث فرق محلية.",
    },
    venue: { en: "Creekside Amphitheatre", ar: "مسرح الخور المفتوح" },
  },
  {
    id: "evt_1002",
    title: { en: "Frontend Architecture Meetup", ar: "لقاء هندسة الواجهات الأمامية" },
    city: { en: "Karachi", ar: "كراتشي" },
    category: "tech",
    startsAt: "2027-01-22T17:00:00Z",
    price: { amount: 0, currency: "USD" },
    description: {
      en: "Talks on micro-frontends, rendering strategies and design systems at scale.",
      ar: "محاضرات عن الواجهات المصغرة واستراتيجيات العرض وأنظمة التصميم على نطاق واسع.",
    },
    venue: { en: "Harbour Tech Hub", ar: "مركز الميناء التقني" },
  },
  {
    id: "evt_1003",
    title: { en: "Street Food Festival", ar: "مهرجان أطعمة الشوارع" },
    city: { en: "Cairo", ar: "القاهرة" },
    category: "food",
    startsAt: "2027-02-05T16:00:00Z",
    price: { amount: 10, currency: "USD" },
    description: {
      en: "Forty vendors, live cooking stations and a dessert alley.",
      ar: "أربعون بائعًا ومحطات طهي حية وممر للحلويات.",
    },
    venue: { en: "Riverside Gardens", ar: "حدائق ضفاف النهر" },
  },
  {
    id: "evt_1004",
    title: { en: "Modern Calligraphy Workshop", ar: "ورشة الخط العربي الحديث" },
    city: { en: "Amman", ar: "عمّان" },
    category: "art",
    startsAt: "2027-02-12T10:00:00Z",
    price: { amount: 30, currency: "USD" },
    description: {
      en: "A hands-on workshop blending classical scripts with contemporary design.",
      ar: "ورشة عملية تمزج الخطوط الكلاسيكية بالتصميم المعاصر.",
    },
    venue: { en: "Old Town Art House", ar: "دار الفنون في البلدة القديمة" },
  },
  {
    id: "evt_1005",
    title: { en: "Indie Game Showcase", ar: "معرض الألعاب المستقلة" },
    city: { en: "London", ar: "لندن" },
    category: "tech",
    startsAt: "2027-03-01T12:00:00Z",
    price: { amount: 20, currency: "USD" },
    description: {
      en: "Play unreleased games and meet the small studios behind them.",
      ar: "جرّب ألعابًا لم تُطرح بعد وتعرّف على الاستوديوهات الصغيرة التي تقف خلفها.",
    },
    venue: { en: "Canal Street Hall", ar: "قاعة شارع القناة" },
  },
  {
    id: "evt_1006",
    title: { en: "Sunrise Desert Run", ar: "سباق الصحراء عند الشروق" },
    city: { en: "Muscat", ar: "مسقط" },
    category: "sports",
    startsAt: "2027-03-08T05:30:00Z",
    price: { amount: 25, currency: "USD" },
    description: {
      en: "A 10 km trail run across the dunes, finishing with breakfast at camp.",
      ar: "سباق مسافته عشرة كيلومترات عبر الكثبان ينتهي بإفطار في المخيم.",
    },
    venue: { en: "Dune Camp", ar: "مخيم الكثبان" },
  },
];
