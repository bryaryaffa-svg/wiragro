"use client";

import Link from "next/link";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
import { AgriScene } from "@/components/ui/agri-scene";
import { trackUiEvent } from "@/lib/analytics";

type ProblemSelectorItem = {
  description: string;
  href: string;
  icon: AgriIconName;
  label: string;
  selected?: boolean;
  symptomHint: string;
};

export function ProblemSelector({
  items,
}: {
  items: ProblemSelectorItem[];
}) {
  return (
    <section className="solution-selector-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">State 2</span>
          <h2>Apa masalah yang terlihat?</h2>
          <p>
            Pilih gejala atau masalah utama yang paling mendekati kondisi tanaman.
          </p>
        </div>
      </div>

      <div className="selector-grid selector-grid--problems">
        {items.map((item) => (
          <Link
            aria-current={item.selected ? "step" : undefined}
            className={`selector-card selector-card--problem${item.selected ? " is-selected" : ""}`}
            href={item.href}
            key={item.label}
            onClick={() =>
              trackUiEvent("select_problem", {
                problem: item.label,
              })
            }
          >
            <div className="selector-card__visual">
              <AgriScene mode="problem" name={item.icon} />
            </div>
            <div className="selector-card__content">
              <span className="selector-card__eyebrow">
                <AgriIcon name="warning" />
                Gejala lapangan
              </span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <small>{item.symptomHint}</small>
              <span className="selector-card__cta">Lihat arahan</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
