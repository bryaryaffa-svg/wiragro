interface WiragroLockupProps {
  className?: string;
  contextLabel?: string;
  tone?: "dark" | "light";
}

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function WiragroLockup({
  className,
  contextLabel = "Sidomakmur storefront",
  tone = "dark",
}: WiragroLockupProps) {
  return (
    <span className={joinClassNames("wiragro-lockup", `wiragro-lockup--${tone}`, className)}>
      <span aria-hidden="true" className="wiragro-lockup__mark">
        <svg
          fill="none"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 46C17.8 42.1 24.8 40.1 32 40.1C39.2 40.1 46.2 42.1 53 46V54H11V46Z"
            fill="var(--wiragro-field-warm)"
          />
          <path
            d="M11 53.2C18.1 50.8 25.1 49.6 32 49.6C38.9 49.6 45.9 50.8 53 53.2V58H11V53.2Z"
            fill="var(--wiragro-field-fresh)"
          />
          <path
            d="M18 41.8L23.5 20H28.6L32.1 30.8L36.9 18L41.7 30.8L45.4 20H50.6L45 41.8H40.4L36.4 31.5L31.7 41.8H27.1L23.1 31.5L19 41.8H18Z"
            fill="var(--wiragro-mark-main)"
          />
          <path
            d="M33.8 14.1C38.3 16.4 40.5 19.8 40.5 24.2C40.5 26.2 39.9 28.4 38.6 30.6C36.8 30 35.3 28.8 34.1 27.1C33.8 28.7 32.7 29.9 30.8 30.9C29.3 28.8 28.6 26.6 28.6 24.3C28.6 20.2 30.3 16.8 33.8 14.1Z"
            fill="var(--wiragro-mark-leaf)"
          />
        </svg>
      </span>

      <span className="wiragro-lockup__copy">
        <strong className="wiragro-lockup__wordmark">Wiragro</strong>
        <span className="wiragro-lockup__context">{contextLabel}</span>
      </span>
    </span>
  );
}
