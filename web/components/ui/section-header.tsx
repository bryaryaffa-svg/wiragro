import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function SectionHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: {
  action?: {
    href: string;
    label: string;
    variant?: "primary" | "secondary";
  };
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className={joinClassNames("section-heading", className)}>
      <div>
        {eyebrow ? <span className="eyebrow-label">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? (
        action.variant === "primary" ? (
          <PrimaryButton href={action.href}>{action.label}</PrimaryButton>
        ) : (
          <SecondaryButton href={action.href}>{action.label}</SecondaryButton>
        )
      ) : null}
    </div>
  );
}
