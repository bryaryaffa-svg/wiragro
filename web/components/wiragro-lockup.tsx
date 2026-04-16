interface WiragroLockupProps {
  className?: string;
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
        <linearGradient id="wiragroMarkBg" x1="12" x2="84" y1="12" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16591F" />
          <stop offset="1" stopColor="#2C7B33" />
        </linearGradient>
        <linearGradient id="wiragroMarkLeafMain" x1="45" x2="60" y1="21" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3FF6A" />
          <stop offset="1" stopColor="#B7DE2F" />
        </linearGradient>
      </defs>

      <rect x="10" y="10" width="76" height="76" rx="22" fill="url(#wiragroMarkBg)" />

      <path
        d="M16.2 62.8C24.6 57.7 35.4 55.1 48.4 55.1C61.8 55.1 72.4 57.5 80 62.2V66C71.4 69 60.7 70.5 48 70.5C35.4 70.5 24.8 69.2 16.2 66.6V62.8Z"
        fill="#F59E0B"
      />
      <path
        d="M16.5 67.4C24.9 64.4 35.1 62.9 47.2 62.9C59 62.9 69.1 64.5 77.8 67.7C70.7 73.5 60.9 76.5 48.8 76.5C36 76.5 25.2 73.4 16.5 67.4Z"
        fill="#78B82A"
      />
      <path
        d="M31.6 69.6C37.1 67.6 43.1 66.7 49.4 66.7C58.8 66.7 66.6 68.8 72.6 73.1C66.7 78 59.2 80.4 50 80.4C41.2 80.4 35 76.8 31.6 69.6Z"
        fill="#D8F147"
      />

      <path
        d="M23.8 31H35.4L41 49.3L45.6 31H52.5L48.2 60.1H38.4L23.8 31Z"
        fill="#FFF8EE"
      />
      <path
        d="M72.2 31H60.6L55 49.3L50.4 31H43.5L47.8 60.1H57.6L72.2 31Z"
        fill="#FFF8EE"
      />

      <path
        d="M50.6 20.6C56.6 24.5 59.6 30.4 59.6 38.2C59.6 43.8 57.1 48.7 52.1 52.8C47.2 49.2 44.8 44.2 44.8 37.8C44.8 31.4 46.7 25.6 50.6 20.6Z"
        fill="url(#wiragroMarkLeafMain)"
      />
      <path
        d="M39.7 28.8C44.7 29.9 48.2 33.4 50.5 39.1C49.4 44.3 46.4 48.1 41.5 50.6C36.8 46.8 34.5 42.8 34.5 38.4C34.5 34.6 36.2 31.4 39.7 28.8Z"
        fill="#58B72B"
      />
      <path d="M48.8 29.2V56.8" stroke="#1D5B1F" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M48.8 39.3C46.8 37.4 45.2 35.1 43.9 32.3" stroke="#1D5B1F" strokeLinecap="round" strokeWidth="1.1" />
    </svg>
  );
}

export function WiragroLockup({
  className,
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
        <span className="wiragro-lockup__context">Sidomakmur Storefront</span>
      </span>
    </span>
  );
}
