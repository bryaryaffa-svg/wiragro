import Link from "next/link";

import { AgriScene } from "@/components/ui/agri-scene";
import type { AgriIconName } from "@/components/ui/agri-icon";
import type { CommodityHub } from "@/lib/commodity-content";
import { WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

const COMMODITY_SCENE: Record<CommodityHub["theme"], { icon: AgriIconName; asset: string }> = {
  chili: {
    asset: WIRAGRO_ICON_ASSETS.chili,
    icon: "chili",
  },
  corn: {
    asset: WIRAGRO_ICON_ASSETS.corn,
    icon: "corn",
  },
  fruit: {
    asset: WIRAGRO_ICON_ASSETS.tomato,
    icon: "tomato",
  },
  homegarden: {
    asset: WIRAGRO_ICON_ASSETS.horti,
    icon: "horti",
  },
  leafy: {
    asset: WIRAGRO_ICON_ASSETS.leaf,
    icon: "leaf",
  },
  rice: {
    asset: WIRAGRO_ICON_ASSETS.rice,
    icon: "rice",
  },
};

export function CommodityHubCard({
  commodity,
}: {
  commodity: CommodityHub;
}) {
  const scene = COMMODITY_SCENE[commodity.theme];

  return (
    <article className={`commodity-hub-card commodity-hub-card--${commodity.theme}`}>
      <div className="commodity-hub-card__visual">
        <AgriScene
          assetSrc={scene.asset}
          badgeText="Komoditas"
          chipText={commodity.label}
          mode="crop"
          name={scene.icon}
        />
      </div>
      <div className="commodity-hub-card__copy">
        <span className="eyebrow-label">Komoditas</span>
        <strong>{commodity.label}</strong>
        <p>{commodity.description}</p>
      </div>
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
