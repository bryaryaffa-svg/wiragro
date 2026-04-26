import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

export function StickyMobileCTA({
  primary,
  secondary,
}: {
  primary: {
    href: string;
    label: string;
  };
  secondary?: {
    href: string;
    label: string;
  };
}) {
  return (
    <div className="sticky-mobile-cta" role="region" aria-label="Aksi cepat mobile">
      <PrimaryButton href={primary.href}>{primary.label}</PrimaryButton>
      {secondary ? <SecondaryButton href={secondary.href}>{secondary.label}</SecondaryButton> : null}
    </div>
  );
}
