import Image from "next/image";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";

type AgriSceneMode = "crop" | "problem";
type AgriSceneTone = "amber" | "earth" | "gold" | "green" | "rose" | "teal";

type AgriSceneConfig = {
  asset: string;
  badge: string;
  chip: string;
  tone: AgriSceneTone;
};

const AGRO_SCENE_CONFIG: Partial<Record<AgriIconName, AgriSceneConfig>> = {
  chili: {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    badge: "Komoditas",
    chip: "Intensif & sensitif",
    tone: "rose",
  },
  corn: {
    asset: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    badge: "Komoditas",
    chip: "Fase vegetatif",
    tone: "amber",
  },
  "fruit-drop": {
    asset: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    badge: "Fase generatif",
    chip: "Pantau stres tanaman",
    tone: "amber",
  },
  fungus: {
    asset: "/wiragro-illustrations/wiragro_dekor_ranting_transparent.png",
    badge: "Bercak aktif",
    chip: "Lihat pola sebar",
    tone: "rose",
  },
  grid: {
    asset: "/wiragro-illustrations/wiragro_dekor_gerobak_tanam_transparent.png",
    badge: "Explorer",
    chip: "Lihat semua opsi",
    tone: "green",
  },
  horti: {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    badge: "Komoditas",
    chip: "Sayur & buah",
    tone: "green",
  },
  melon: {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    badge: "Komoditas",
    chip: "Buah generatif",
    tone: "amber",
  },
  nutrition: {
    asset: "/wiragro-illustrations/wiragro_icon_nutrisi_transparent.png",
    badge: "Nutrisi",
    chip: "Baca fase tanam",
    tone: "teal",
  },
  onion: {
    asset: "/wiragro-illustrations/wiragro_dekor_tunas_kecil_transparent.png",
    badge: "Komoditas",
    chip: "Daun & umbi",
    tone: "gold",
  },
  palm: {
    asset: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    badge: "Komoditas",
    chip: "Skala kebun",
    tone: "earth",
  },
  pest: {
    asset: "/wiragro-illustrations/wiragro_icon_pestisida_transparent.png",
    badge: "Pantau hama",
    chip: "Butuh identifikasi",
    tone: "earth",
  },
  rice: {
    asset: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    badge: "Komoditas",
    chip: "Sawah & tanaman pangan",
    tone: "gold",
  },
  root: {
    asset: "/wiragro-illustrations/wiragro_dekor_tanah_transparent.png",
    badge: "Zona akar",
    chip: "Cek drainase",
    tone: "earth",
  },
  stunted: {
    asset: "/wiragro-illustrations/wiragro_dekor_tunas_kecil_transparent.png",
    badge: "Fase awal",
    chip: "Cek akar & media",
    tone: "green",
  },
  tomato: {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    badge: "Komoditas",
    chip: "Bunga & buah",
    tone: "rose",
  },
  weed: {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    badge: "Area lapang",
    chip: "Gulma mengganggu",
    tone: "green",
  },
  "yellow-leaf": {
    asset: "/wiragro-illustrations/wiragro_dekor_daun_kiri_transparent.png",
    badge: "Cek daun",
    chip: "Gejala awal",
    tone: "gold",
  },
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AgriScene({
  assetSrc,
  badgeText,
  chipText,
  className,
  mode = "problem",
  name,
  showLabels = false,
}: {
  assetSrc?: string | null;
  badgeText?: string;
  chipText?: string;
  className?: string;
  mode?: AgriSceneMode;
  name: AgriIconName;
  showLabels?: boolean;
}) {
  const config = AGRO_SCENE_CONFIG[name] ?? {
    asset: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
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
