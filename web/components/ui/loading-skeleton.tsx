export function LoadingSkeleton({
  cards = 3,
  eyebrow = "Memuat Wiragro",
  title = "Menyiapkan halaman pertanian digital...",
}: {
  cards?: number;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="loading-skeleton">
      <div className="loading-skeleton__panel">
        <span className="eyebrow-label">{eyebrow}</span>
        <div className="loading-skeleton__line loading-skeleton__line--title" aria-hidden="true" />
        <div className="loading-skeleton__line loading-skeleton__line--body" aria-hidden="true" />
        <div className="loading-skeleton__line loading-skeleton__line--body short" aria-hidden="true" />
        <p className="sr-only">{title}</p>
      </div>
      <div className="loading-skeleton__grid" aria-hidden="true">
        {Array.from({ length: cards }).map((_, index) => (
          <div className="loading-skeleton__card" key={`skeleton-${index}`}>
            <div className="loading-skeleton__thumb" />
            <div className="loading-skeleton__line loading-skeleton__line--card" />
            <div className="loading-skeleton__line loading-skeleton__line--meta" />
          </div>
        ))}
      </div>
    </section>
  );
}
