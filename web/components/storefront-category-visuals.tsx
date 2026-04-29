import type { ReactNode } from "react";
import Image from "next/image";

import type {
  CategoryMascotKind,
  StorefrontMainCategory,
  SubcategoryIconKind,
} from "@/lib/storefront-category-system";
import { WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

type MascotPalette = Pick<StorefrontMainCategory, "accent" | "accentSoft" | "accentWarm">;

const OUTLINE = "#294332";
const SOIL = "#8a623f";
const LEAF = "#69a947";
const LEAF_LIGHT = "#cce26a";
const CREAM = "#fff8ef";
const LIGHT_FILL = "#f4efe5";

const SUBCATEGORY_ICON_ASSETS: Partial<Record<SubcategoryIconKind, string>> = {
  bag: WIRAGRO_ICON_ASSETS.bag,
  box: WIRAGRO_ICON_ASSETS.bag,
  cover: WIRAGRO_ICON_ASSETS.leaf,
  feed: WIRAGRO_ICON_ASSETS.fieldBounty,
  harvest: WIRAGRO_ICON_ASSETS.fieldBounty,
  pot: WIRAGRO_ICON_ASSETS.polybag,
  seed: WIRAGRO_ICON_ASSETS.seed,
  service: WIRAGRO_ICON_ASSETS.service,
  shield: WIRAGRO_ICON_ASSETS.shield,
  soil: WIRAGRO_ICON_ASSETS.soil,
  spark: WIRAGRO_ICON_ASSETS.spark,
  spray: WIRAGRO_ICON_ASSETS.spray,
  sprout: WIRAGRO_ICON_ASSETS.sprout,
  store: WIRAGRO_ICON_ASSETS.product,
  tool: WIRAGRO_ICON_ASSETS.tool,
  tray: WIRAGRO_ICON_ASSETS.tray,
  water: WIRAGRO_ICON_ASSETS.water,
};

function MascotFrame({
  palette,
  children,
}: {
  palette: MascotPalette;
  children: ReactNode;
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 124">
      <rect
        fill={palette.accentSoft}
        height="120"
        rx="26"
        stroke="rgba(41,67,50,0.08)"
        width="156"
        x="2"
        y="2"
      />
      <ellipse cx="118" cy="24" fill={palette.accentWarm} opacity="0.8" rx="24" ry="16" />
      <ellipse cx="40" cy="96" fill="#fffdf7" opacity="0.9" rx="26" ry="18" />
      <ellipse cx="84" cy="104" fill={SOIL} opacity="0.22" rx="44" ry="10" />
      {children}
    </svg>
  );
}

function BagScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path
        d="M58 25h36l5 13-5 10H58l-5-10 5-13Z"
        fill={palette.accentWarm}
        opacity="0.92"
      />
      <path
        d="M50 42h52l-4 47H54l-4-47Z"
        fill={CREAM}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path d="M59 51c10-7 18-7 28 0" fill="none" opacity="0.2" stroke={OUTLINE} strokeWidth="2" />
      <path
        d="M74 55c5-8 15-8 20 0-5 5-8 10-10 18-2-8-5-13-10-18Z"
        fill={LEAF_LIGHT}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M69 59c-5 2-8 7-7 14 8 0 13-3 16-11-2-2-4-3-9-3Z"
        fill={LEAF}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M80 56v23" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.2" />
      <path d="M52 88h46" fill="none" opacity="0.28" stroke={palette.accent} strokeWidth="6" />
    </MascotFrame>
  );
}

function BottleScene({ palette, withShield = false, withSpray = false }: { palette: MascotPalette; withShield?: boolean; withSpray?: boolean }) {
  return (
    <MascotFrame palette={palette}>
      <rect fill={palette.accent} height="12" rx="4" width="22" x="69" y="20" />
      <path
        d="M63 30h34l4 12v34c0 7-5 12-12 12H71c-7 0-12-5-12-12V42l4-12Z"
        fill={CREAM}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <rect fill={palette.accentSoft} height="22" rx="8" width="32" x="64" y="50" />
      {withShield ? (
        <path
          d="M79 49c8 0 13 2 13 2v8c0 7-5 13-13 16-8-3-13-9-13-16v-8s5-2 13-2Z"
          fill="#ffe4da"
          stroke={OUTLINE}
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ) : (
        <>
          <path
            d="M79 50c6-8 16-7 21 1-5 5-9 11-11 20-3-10-6-15-10-21Z"
            fill={LEAF_LIGHT}
            stroke={OUTLINE}
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M72 53c-5 2-8 7-7 13 7 0 12-3 15-10-2-2-4-3-8-3Z"
            fill={LEAF}
            stroke={OUTLINE}
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </>
      )}
      {withSpray ? (
        <>
          <path d="M95 34h10l8 5" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.4" />
          <path d="M114 39c7 1 10 3 14 7" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2" />
          <circle cx="130" cy="48" fill={palette.accent} r="2.4" />
          <circle cx="138" cy="52" fill={palette.accent} r="2" />
          <circle cx="134" cy="43" fill={palette.accentSoft} r="2.3" stroke={OUTLINE} strokeWidth="1.6" />
        </>
      ) : null}
    </MascotFrame>
  );
}

function SeedScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path
        d="M80 24c18 0 34 19 34 35 0 21-15 35-34 35S46 80 46 59c0-16 16-35 34-35Z"
        fill={CREAM}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path
        d="M79 46c8-8 21-7 26 2-7 6-12 14-15 24-3-11-7-18-11-26Z"
        fill={LEAF_LIGHT}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M68 49c-6 2-10 8-9 16 9 0 15-4 18-13-2-2-4-4-9-3Z"
        fill={LEAF}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <circle cx="80" cy="99" fill={palette.accent} opacity="0.14" r="9" />
    </MascotFrame>
  );
}

function PotScene({ palette, double = false }: { palette: MascotPalette; double?: boolean }) {
  return (
    <MascotFrame palette={palette}>
      {double ? (
        <>
          <path d="M42 58h30l-4 24H46l-4-24Z" fill={palette.accentWarm} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
          <path d="M88 52h30l-4 30H92l-4-30Z" fill={CREAM} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
          <path d="M56 57c3-9 8-16 16-21 8 6 12 13 14 22" fill="none" stroke={LEAF} strokeLinecap="round" strokeWidth="6" />
          <path d="M74 34c5-8 13-8 18 0" fill="none" stroke={LEAF_LIGHT} strokeLinecap="round" strokeWidth="6" />
        </>
      ) : (
        <>
          <path d="M55 58h50l-5 28H60l-5-28Z" fill={CREAM} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.4" />
          <path d="M80 58V44" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.2" />
          <path d="M80 44c5-13 16-19 27-17-2 11-8 19-19 24" fill={LEAF_LIGHT} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
          <path d="M80 47c-7-11-18-15-27-11 1 11 8 18 20 21" fill={LEAF} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
        </>
      )}
    </MascotFrame>
  );
}

function SoilScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path d="M52 82c10-20 46-20 56 0H52Z" fill={SOIL} />
      <path d="M102 36 74 82" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="3.2" />
      <path
        d="m99 38 14 12c2 2 1 5-1 6l-12 5c-3 1-5-1-5-4V42c0-4 2-5 4-4Z"
        fill={LIGHT_FILL}
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M51 74c4-6 10-11 18-13 7 2 11 6 15 12" fill="none" stroke={LEAF} strokeLinecap="round" strokeWidth="5" />
    </MascotFrame>
  );
}

function TrayScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <rect fill={OUTLINE} height="18" opacity="0.12" rx="9" width="64" x="48" y="77" />
      <rect fill={CREAM} height="24" rx="10" stroke={OUTLINE} strokeWidth="2.2" width="70" x="45" y="54" />
      {[55, 70, 85].map((x) => (
        <g key={x}>
          <path d={`M${x} 54v-10`} fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2" />
          <path d={`M${x} 43c4-8 10-10 15-8-1 7-5 11-11 14`} fill={LEAF_LIGHT} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="1.8" />
          <path d={`M${x} 44c-4-7-10-8-15-5 1 7 5 10 11 12`} fill={LEAF} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="1.8" />
        </g>
      ))}
    </MascotFrame>
  );
}

function ToolsScene({ palette, withCrate = false }: { palette: MascotPalette; withCrate?: boolean }) {
  return (
    <MascotFrame palette={palette}>
      {withCrate ? (
        <>
          <rect fill={CREAM} height="30" rx="9" stroke={OUTLINE} strokeWidth="2.4" width="54" x="52" y="56" />
          <path d="M52 67h54M62 56v30M78 56v30M94 56v30" fill="none" stroke={OUTLINE} strokeWidth="2" />
          <path d="M67 52c4-7 9-10 16-10 0 7-4 12-10 16" fill={LEAF} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2" />
          <path d="M90 48c4-7 9-10 15-10 0 7-4 12-10 16" fill={LEAF_LIGHT} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M59 34v48" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="3.2" />
          <path d="M95 30v52" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="3.2" />
          <path d="M49 34h20l-4 14H53l-4-14Z" fill={LIGHT_FILL} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
          <path d="M86 31h18M89 38h12M92 45h6" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="4" />
        </>
      )}
    </MascotFrame>
  );
}

function WaterScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path
        d="M59 45c0-12 10-22 22-22h23"
        fill="none"
        stroke={OUTLINE}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path d="M108 20h16" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="5" />
      <path
        d="M85 44c10 12 15 21 15 30a15 15 0 1 1-30 0c0-9 5-18 15-30Z"
        fill="#8ed6ff"
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path d="M43 83c9-5 19-5 28 0" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="4" />
    </MascotFrame>
  );
}

function CoverScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path
        d="M42 74c7-19 22-31 38-31s31 12 38 31"
        fill={palette.accentSoft}
        opacity="0.9"
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M47 74h66" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.2" />
      <path d="M80 74V57" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2" />
      <path d="M80 57c5-12 15-15 23-12-1 10-6 16-15 20" fill={LEAF_LIGHT} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2" />
      <path d="M79 59c-6-10-14-13-22-10 1 9 6 15 14 18" fill={LEAF} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2" />
    </MascotFrame>
  );
}

function PackageScene({ palette }: { palette: MascotPalette }) {
  return (
    <MascotFrame palette={palette}>
      <path d="M50 47h34v38H50z" fill={CREAM} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M50 57h34M67 47v38" fill="none" stroke={OUTLINE} strokeWidth="2" />
      <path d="M92 40h20l4 10-4 35H92l-4-35 4-10Z" fill={palette.accentWarm} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M100 57c5-6 12-6 16 0" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="3.4" />
    </MascotFrame>
  );
}

function StoreScene({ palette, service = false, feed = false }: { palette: MascotPalette; service?: boolean; feed?: boolean }) {
  return (
    <MascotFrame palette={palette}>
      {service ? (
        <>
          <rect fill={CREAM} height="42" rx="12" stroke={OUTLINE} strokeWidth="2.4" width="40" x="60" y="40" />
          <path d="M68 52h24M68 61h18" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="3.2" />
          <path d="M54 54c0-8 6-14 14-14M106 54c0-8-6-14-14-14" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.4" />
          <path d="M48 57v5c0 4 3 7 7 7h3M112 57v5c0 4-3 7-7 7h-3" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.4" />
        </>
      ) : feed ? (
        <>
          <path d="M58 38h36l6 14-6 34H64L58 52l6-14Z" fill={CREAM} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.4" />
          <path d="M92 52h18l6 10" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="2.4" />
          <path d="M109 61c6 0 9 4 9 8h-18c0-4 3-8 9-8Z" fill={palette.accentWarm} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.2" />
        </>
      ) : (
        <>
          <path d="M54 47h42l10 37H44l10-37Z" fill={CREAM} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="2.4" />
          <path d="M62 47c0-10 6-16 13-16h1c7 0 13 6 13 16" fill="none" stroke={OUTLINE} strokeWidth="2.2" />
          <rect fill={palette.accentSoft} height="23" rx="8" width="24" x="96" y="35" />
          <path d="M100 40h16M100 45h12M100 50h10" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="3" />
        </>
      )}
    </MascotFrame>
  );
}

export function CategoryMascot({
  kind,
  palette,
}: {
  kind: CategoryMascotKind;
  palette: MascotPalette;
}) {
  switch (kind) {
    case "pupuk":
      return <BagScene palette={palette} />;
    case "nutrisi":
      return <BottleScene palette={palette} />;
    case "benih":
      return <SeedScene palette={palette} />;
    case "bibit":
      return <PotScene palette={palette} />;
    case "pestisida":
      return <BottleScene palette={palette} withShield />;
    case "tanah":
      return <SoilScene palette={palette} />;
    case "media":
      return <BagScene palette={palette} />;
    case "persemaian":
      return <TrayScene palette={palette} />;
    case "wadah":
      return <PotScene palette={palette} double />;
    case "alat":
      return <ToolsScene palette={palette} />;
    case "sprayer":
      return <BottleScene palette={palette} withSpray />;
    case "irigasi":
      return <WaterScene palette={palette} />;
    case "mulsa":
      return <CoverScene palette={palette} />;
    case "panen":
      return <ToolsScene palette={palette} withCrate />;
    case "kemasan":
      return <PackageScene palette={palette} />;
    case "peternakan":
      return <StoreScene palette={palette} feed />;
    case "kios":
      return <StoreScene palette={palette} />;
    case "layanan":
      return <StoreScene palette={palette} service />;
  }
}

export function SubcategoryIcon({ kind }: { kind: SubcategoryIconKind }) {
  const asset = SUBCATEGORY_ICON_ASSETS[kind];

  if (asset) {
    return (
      <Image
        alt=""
        aria-hidden="true"
        className="subcategory-image-icon"
        fill
        sizes="28px"
        src={asset}
      />
    );
  }

  switch (kind) {
    case "bag":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M6 4h8l1 3-1 8H6L5 7l1-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M7.5 8c1.5-1 3.5-1 5 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case "spark":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="m10 2 1.4 4.6L16 8l-4.6 1.4L10 14l-1.4-4.6L4 8l4.6-1.4L10 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "seed":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M10 3c3.3 0 6 3.5 6 6.5A6 6 0 1 1 4 9.5C4 6.5 6.7 3 10 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M10 6v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case "sprout":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M10 16V8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          <path d="M10 9c3-4 5.8-4.6 7.2-3.5-1 3-3.1 4.7-6.7 5.3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M10 10C7.5 6.6 4.8 6 3 7.1c.8 2.8 2.7 4.3 6 4.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "shield":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M10 3c3 0 5 .8 5 .8v4.3c0 3.6-2.2 6.3-5 8-2.8-1.7-5-4.4-5-8V3.8S7 3 10 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "soil":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M4 13c1.7-2.8 3.8-4.2 6-4.2 2.3 0 4.4 1.4 6 4.2H4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "tray":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <rect height="7" rx="2" stroke="currentColor" strokeWidth="1.6" width="12" x="4" y="9" />
          <path d="M8 9V5M12 9V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
    case "pot":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M6 9h8l-1 6H7L6 9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M10 9V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
          <path d="M10 6c2.2-2.2 4-2.5 5.2-1.8-.5 1.9-1.8 3-4.3 3.7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      );
    case "tool":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M7 4v11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          <path d="M13 4v11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          <path d="M4.8 5.1h4.4M11 5.1h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "spray":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M7 6h6l1 3v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l1-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M14 7h2.5L18 8.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          <circle cx="16.8" cy="10.2" fill="currentColor" r="1" />
        </svg>
      );
    case "water":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M10 4c2.3 2.7 3.6 4.7 3.6 6.8a3.6 3.6 0 1 1-7.2 0C6.4 8.7 7.7 6.7 10 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "cover":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M4 12c1.8-4 4.4-6 6-6 1.8 0 4.4 2 6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          <path d="M10 12V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
    case "harvest":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <rect height="5.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" width="10" x="5" y="9" />
          <path d="M7.5 9V6.8c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2V9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "box":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.2 10 4l5 3.2v5.7L10 16l-5-3.1V7.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M10 4v12" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "feed":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M6 5h8l1 3-1 7H6L5 8l1-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M12.5 9h2.4l.8 1.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
    case "store":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M6 7h8l2 8H4l2-8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M7.5 7a2.5 2.5 0 1 1 5 0" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "service":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path d="M5 10a5 5 0 0 1 10 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          <path d="M4.5 10.5v2.2c0 .9.7 1.6 1.6 1.6H7M15.5 10.5v2.2c0 .9-.7 1.6-1.6 1.6H13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
  }
}
