import { AgriIcon } from "@/components/ui/agri-icon";

export function TrustBadge({
  icon,
  label,
  tone = "default",
}: {
  icon: Parameters<typeof AgriIcon>[0]["name"];
  label: string;
  tone?: "accent" | "default" | "success";
}) {
  return (
    <span className={`trust-badge trust-badge--${tone}`}>
      <span className="trust-badge__icon">
        <AgriIcon name={icon} />
      </span>
      <span>{label}</span>
    </span>
  );
}
