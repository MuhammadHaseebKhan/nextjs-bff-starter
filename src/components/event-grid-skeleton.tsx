export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="h-44 rounded-2xl bg-black/5 dark:bg-white/10" />
      ))}
    </ul>
  );
}
