"use client";

import Link from "next/link";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
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
          <span className="eyebrow-label">State 1</span>
          <h2>Pilih tanaman Anda</h2>
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
            <span className="selector-card__icon">
              <AgriIcon name={item.icon} />
            </span>
            <strong>{item.label}</strong>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
