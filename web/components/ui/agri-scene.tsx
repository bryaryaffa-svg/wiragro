import Image from "next/image";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
import { WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

type AgriSceneMode = "crop" | "problem";
type AgriSceneAssetFit = "contain" | "cover";
type AgriSceneTone = "amber" | "earth" | "gold" | "green" | "rose" | "teal";

type AgriSceneConfig = {
  asset: string;
  badge: string;
  chip: string;
  tone: AgriSceneTone;
};

const AGRO_SCENE_CONFIG: Partial<Record<AgriIconName, AgriSceneConfig>> = {
  chili: {
    asset: WIRAGRO_ICON_ASSETS.chili,
    badge: "Komoditas",
    chip: "Intensif & sensitif",
    tone: "rose",
  },
  corn: {
    asset: WIRAGRO_ICON_ASSETS.corn,
    badge: "Komoditas",
    chip: "Fase vegetatif",
    tone: "amber",
  },
  "fruit-drop": {
    asset: WIRAGRO_ICON_ASSETS.fruitDrop,
    badge: "Fase generatif",
    chip: "Pantau stres tanaman",
    tone: "amber",
  },
  fungus: {
    asset: WIRAGRO_ICON_ASSETS.fungus,
    badge: "Bercak aktif",
    chip: "Lihat pola sebar",
    tone: "rose",
  },
  grid: {
    asset: WIRAGRO_ICON_ASSETS.grid,
    badge: "Explorer",
    chip: "Lihat semua opsi",
    tone: "green",
  },
  horti: {
    asset: WIRAGRO_ICON_ASSETS.horti,
    badge: "Komoditas",
    chip: "Sayur & buah",
    tone: "green",
  },
  melon: {
    asset: WIRAGRO_ICON_ASSETS.melon,
    badge: "Komoditas",
    chip: "Buah generatif",
    tone: "amber",
  },
  nutrition: {
    asset: WIRAGRO_ICON_ASSETS.nutrition,
    badge: "Nutrisi",
    chip: "Baca fase tanam",
    tone: "teal",
  },
  onion: {
    asset: WIRAGRO_ICON_ASSETS.onion,
    badge: "Komoditas",
    chip: "Daun & umbi",
    tone: "gold",
  },
  palm: {
    asset: WIRAGRO_ICON_ASSETS.palm,
    badge: "Komoditas",
    chip: "Skala kebun",
    tone: "earth",
  },
  pest: {
    asset: WIRAGRO_ICON_ASSETS.pest,
    badge: "Pantau hama",
    chip: "Butuh identifikasi",
    tone: "earth",
  },
  rice: {
    asset: WIRAGRO_ICON_ASSETS.rice,
    badge: "Komoditas",
    chip: "Sawah & tanaman pangan",
    tone: "gold",
  },
  root: {
    asset: WIRAGRO_ICON_ASSETS.root,
    badge: "Zona akar",
    chip: "Cek drainase",
    tone: "earth",
  },
  stunted: {
    asset: WIRAGRO_ICON_ASSETS.stunted,
    badge: "Fase awal",
    chip: "Cek akar & media",
    tone: "green",
  },
  tomato: {
    asset: WIRAGRO_ICON_ASSETS.tomato,
    badge: "Komoditas",
    chip: "Bunga & buah",
    tone: "rose",
  },
  weed: {
    asset: WIRAGRO_ICON_ASSETS.weed,
    badge: "Area lapang",
    chip: "Gulma mengganggu",
    tone: "green",
  },
  "yellow-leaf": {
    asset: WIRAGRO_ICON_ASSETS.yellowLeaf,
    badge: "Cek daun",
    chip: "Gejala awal",
    tone: "gold",
  },
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AgriScene({
  assetFit = "contain",
  assetSrc,
  badgeText,
  chipText,
  className,
  mode = "problem",
  name,
  showLabels = false,
}: {
  assetFit?: AgriSceneAssetFit;
  assetSrc?: string | null;
  badgeText?: string;
  chipText?: string;
  className?: string;
  mode?: AgriSceneMode;
  name: AgriIconName;
  showLabels?: boolean;
}) {
  const config = AGRO_SCENE_CONFIG[name] ?? {
    asset: WIRAGRO_ICON_ASSETS.leaf,
    badge: "Wiragro",
    chip: "Solusi pertanian",
    tone: "green" as const,
  };
  const resolvedAsset = assetSrc ?? config.asset;
  const resolvedBadge = badgeText ?? config.badge;
  const resolvedChip = chipText ?? config.chip;

  return (
    <div
      className={joinClassNames(
        "agri-scene",
        `agri-scene--${mode}`,
        `agri-scene--${config.tone}`,
        assetFit === "cover" ? "agri-scene--asset-cover" : undefined,
        className,
      )}
    >
      <span aria-hidden="true" className="agri-scene__wash" />
      <span aria-hidden="true" className="agri-scene__ring agri-scene__ring--one" />
      <span aria-hidden="true" className="agri-scene__ring agri-scene__ring--two" />
      <span aria-hidden="true" className="agri-scene__spark agri-scene__spark--one" />
      <span aria-hidden="true" className="agri-scene__spark agri-scene__spark--two" />

      {showLabels && resolvedBadge ? <span className="agri-scene__badge">{resolvedBadge}</span> : null}
      {showLabels && resolvedChip ? <span className="agri-scene__chip">{resolvedChip}</span> : null}

      <span aria-hidden="true" className="agri-scene__ground" />

      <Image
        alt=""
        aria-hidden="true"
        className="agri-scene__asset"
        fill
        sizes={mode === "crop" ? "(max-width: 768px) 42vw, 180px" : "(max-width: 768px) 42vw, 240px"}
        src={resolvedAsset}
      />

      <span className="agri-scene__icon-shell">
        <AgriIcon className="agri-scene__icon" name={name} />
      </span>
    </div>
  );
}
