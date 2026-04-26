import Link from "next/link";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
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
            <span className="selector-card__icon">
              <AgriIcon name={item.icon} />
            </span>
            <strong>{item.label}</strong>
            <p>{item.description}</p>
            <small>{item.symptomHint}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
