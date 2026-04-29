"use client";

import Link from "next/link";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
import { AgriScene } from "@/components/ui/agri-scene";
import { trackUiEvent } from "@/lib/analytics";

type CropSelectorItem = {
  description: string;
  href: string;
  icon: AgriIconName;
  label: string;
  selected?: boolean;
};

export function CropSelector({
  items,
}: {
  items: CropSelectorItem[];
}) {
  return (
    <section className="solution-selector-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Langkah 1</span>
          <h2>Pilih tanaman</h2>
          <p>
            Agar rekomendasi lebih tepat, mulai dari jenis tanaman yang sedang Anda tangani.
          </p>
        </div>
      </div>

      <div className="selector-grid selector-grid--crops">
        {items.map((item) => (
          <Link
            aria-current={item.selected ? "step" : undefined}
            className={`selector-card${item.selected ? " is-selected" : ""}`}
            href={item.href}
            key={item.label}
            onClick={() =>
              trackUiEvent("select_crop", {
                crop: item.label,
              })
            }
          >
            <div className="selector-card__visual">
              <AgriScene mode="crop" name={item.icon} />
            </div>
            <div className="selector-card__content">
              <span className="selector-card__eyebrow">
                <AgriIcon name="solution" />
                Komoditas pilihan
              </span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <span className="selector-card__cta">Pilih tanaman</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
