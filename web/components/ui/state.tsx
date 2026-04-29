import Image from "next/image";

import { AgriIcon } from "@/components/ui/agri-icon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { WIRAGRO_CATEGORY_ASSETS } from "@/lib/wiragro-assets";

type StateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

function StateActions({ actions }: { actions?: StateAction[] }) {
  if (!actions?.length) {
    return null;
  }

  return (
    <div className="empty-state__actions">
      {actions.map((action) =>
        action.variant === "secondary" ? (
          <SecondaryButton href={action.href} key={`${action.href}-${action.label}`}>
            {action.label}
          </SecondaryButton>
        ) : (
          <PrimaryButton href={action.href} key={`${action.href}-${action.label}`}>
            {action.label}
          </PrimaryButton>
        ),
      )}
    </div>
  );
}

export function EmptyState({
  actions,
  description,
  eyebrow,
  headingLevel = "h1",
  title,
}: {
  actions?: StateAction[];
  description: string;
  eyebrow: string;
  headingLevel?: "h1" | "h2";
  title: string;
}) {
  const HeadingTag = headingLevel;

  return (
    <section className="empty-state state-panel">
      <div className="state-panel__content">
        <span className="state-panel__icon">
          <AgriIcon name="empty" />
        </span>
        <span className="eyebrow-label">{eyebrow}</span>
        <HeadingTag>{title}</HeadingTag>
        <p>{description}</p>
        <StateActions actions={actions} />
      </div>
      <div className="state-panel__visual" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(max-width: 768px) 120px, 180px"
          src={WIRAGRO_CATEGORY_ASSETS.emptyProduct}
        />
      </div>
    </section>
  );
}

export function ErrorState({
  actions,
  description,
  eyebrow,
  headingLevel = "h1",
  title,
}: {
  actions?: StateAction[];
  description: string;
  eyebrow: string;
  headingLevel?: "h1" | "h2";
  title: string;
}) {
  const HeadingTag = headingLevel;

  return (
    <section className="empty-state state-panel state-panel--error">
      <div className="state-panel__content">
        <span className="state-panel__icon">
          <AgriIcon name="error" />
        </span>
        <span className="eyebrow-label">{eyebrow}</span>
        <HeadingTag>{title}</HeadingTag>
        <p>{description}</p>
        <StateActions actions={actions} />
      </div>
      <div className="state-panel__visual" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(max-width: 768px) 120px, 180px"
          src={WIRAGRO_CATEGORY_ASSETS.errorProduct}
        />
      </div>
    </section>
  );
}
