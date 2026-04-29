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
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wiragroMarkBg" x1="14" x2="82" y1="12" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F5A2C" />
          <stop offset="1" stopColor="#1F7A39" />
        </linearGradient>
        <linearGradient id="wiragroMarkField" x1="18" x2="78" y1="63" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F2B33A" />
          <stop offset="1" stopColor="#A7D447" />
        </linearGradient>
        <linearGradient id="wiragroMarkLeaf" x1="35" x2="63" y1="22" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6FFD8" />
          <stop offset="1" stopColor="#BFE75B" />
        </linearGradient>
      </defs>

      <rect x="10" y="10" width="76" height="76" rx="20" fill="url(#wiragroMarkBg)" />
      <path d="M18 65.4C27.8 58.9 39.2 55.7 52.2 55.7C63 55.7 71.6 57.8 78 62V70.8C70.5 76 60.4 78.6 47.8 78.6C35.9 78.6 26 76.1 18 71.1V65.4Z" fill="url(#wiragroMarkField)" />
      <path d="M20.5 69.6C29.1 66.8 38.4 65.4 48.5 65.4C58.6 65.4 67.7 66.9 75.7 69.9" stroke="#FFF8D6" strokeLinecap="round" strokeWidth="3.4" opacity="0.9" />
      <path d="M48 67V31" stroke="#F8FFE3" strokeLinecap="round" strokeWidth="5.2" />
      <path d="M45.6 48.4C35.6 47.3 29.3 39.5 29.6 27.1C41.6 27.7 47.7 34.6 45.6 48.4Z" fill="#F8FFE3" />
      <path d="M50.3 50.6C62.4 48.1 69.1 38.9 66.7 24.6C54.2 27.6 48.5 36.1 50.3 50.6Z" fill="url(#wiragroMarkLeaf)" />
      <path d="M48 55.8C43.6 53.8 39.9 50.9 36.9 47.1" stroke="#0E552B" strokeLinecap="round" strokeWidth="2.1" opacity="0.45" />
      <path d="M48.4 56.3C54.6 52.7 59.2 47.6 62.2 41.1" stroke="#0E552B" strokeLinecap="round" strokeWidth="2.1" opacity="0.45" />
    </svg>
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
