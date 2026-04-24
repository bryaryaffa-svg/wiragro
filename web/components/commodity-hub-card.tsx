import Link from "next/link";

import type { CommodityHub } from "@/lib/commodity-content";

export function CommodityHubCard({
  commodity,
}: {
  commodity: CommodityHub;
}) {
  return (
    <article className={`commodity-hub-card commodity-hub-card--${commodity.theme}`}>
      <span className="eyebrow-label">Komoditas</span>
      <strong>{commodity.label}</strong>
      <p>{commodity.description}</p>
      <ul className="plain-list">
        {commodity.heroBullets.slice(0, 3).map((item) => (
          <li key={`${commodity.slug}-${item}`}>{item}</li>
        ))}
      </ul>
      <div className="commodity-hub-card__links">
        <Link href={`/belajar/komoditas/${commodity.slug}`}>Artikel</Link>
        <Link href={`/solusi/komoditas/${commodity.slug}`}>Solusi</Link>
      </div>
      <Link className="commodity-hub-card__action" href={`/komoditas/${commodity.slug}`}>
        Buka hub {commodity.label}
      </Link>
    </article>
  );
}
