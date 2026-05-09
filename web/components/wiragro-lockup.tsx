interface WiragroLockupProps {
  className?: string;
  contextLabel?: string;
  tone?: "dark" | "light";
  variant?: "header" | "footer";
}

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function WiragroMark() {
  return (
    <img
      alt=""
      aria-hidden="true"
      height={96}
      src="/brand/wiragro-icon.png"
      width={96}
    />
  );
}

export function WiragroLockup({
  className,
  contextLabel = "Platform Solusi Pertanian Digital",
  tone = "dark",
  variant = "header",
}: WiragroLockupProps) {
  return (
    <span
      className={joinClassNames(
        "wiragro-lockup",
        `wiragro-lockup--${tone}`,
        `wiragro-lockup--${variant}`,
        className,
      )}
    >
      <span className="wiragro-lockup__mark">
        <WiragroMark />
      </span>

      <span className="wiragro-lockup__copy">
        <strong className="wiragro-lockup__wordmark">Wiragro</strong>
        <span className="wiragro-lockup__context">{contextLabel}</span>
      </span>
    </span>
  );
}
