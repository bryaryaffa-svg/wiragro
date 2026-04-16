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
        <linearGradient id="wiragroMarkBg" x1="14" x2="82" y1="10" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E4E18" />
          <stop offset="0.54" stopColor="#1B7429" />
          <stop offset="1" stopColor="#275C1D" />
        </linearGradient>
        <linearGradient id="wiragroMarkEdge" x1="20" x2="75" y1="18" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wiragroFieldGold" x1="18" x2="78" y1="57" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFBD2E" />
          <stop offset="1" stopColor="#C85C00" />
        </linearGradient>
        <linearGradient id="wiragroFieldGreen" x1="13" x2="75" y1="62" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#83C63F" />
          <stop offset="1" stopColor="#4B8E24" />
        </linearGradient>
        <linearGradient id="wiragroFieldLime" x1="27" x2="75" y1="66" y2="87" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D6FF55" />
          <stop offset="1" stopColor="#8CCB20" />
        </linearGradient>
        <linearGradient id="wiragroWFill" x1="24" x2="53" y1="26" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF5" />
          <stop offset="1" stopColor="#F3E8C6" />
        </linearGradient>
        <linearGradient id="wiragroLeafMain" x1="49" x2="60" y1="20" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1FF72" />
          <stop offset="1" stopColor="#8AC52A" />
        </linearGradient>
        <linearGradient id="wiragroLeafSide" x1="34" x2="48" y1="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8EE247" />
          <stop offset="1" stopColor="#2E7E20" />
        </linearGradient>
      </defs>

      <rect
        x="10"
        y="10"
        width="76"
        height="76"
        rx="21"
        fill="url(#wiragroMarkBg)"
      />
      <rect
        x="12"
        y="12"
        width="72"
        height="72"
        rx="19"
        fill="url(#wiragroMarkEdge)"
        opacity="0.26"
      />

      <path
        d="M16 60.5C24.4 55.3 35.2 52.6 48.4 52.6C62.8 52.6 73.5 55.5 80.5 61.3L80.5 68.8C70.6 71.9 60 73.4 48.6 73.4C36.8 73.4 25.9 71.7 16 68.2V60.5Z"
        fill="url(#wiragroFieldGold)"
      />
      <path
        d="M16 69.2C24.2 65.8 34.1 64 45.8 64C56.4 64 66.5 65.6 76.2 68.7C68.1 75 56.8 78.2 42.4 78.2C31.7 78.2 22.9 75.2 16 69.2Z"
        fill="url(#wiragroFieldGreen)"
      />
      <path
        d="M31.2 70.2C37.7 67.9 44.3 66.8 51 66.8C61.4 66.8 69.6 69.1 75.7 73.6C69.5 79.5 61.8 82.5 52.6 82.5C42.2 82.5 35.1 78.4 31.2 70.2Z"
        fill="url(#wiragroFieldLime)"
      />

      <path
        d="M23.8 29.4H37.7L42.4 49.1L47.5 29.4H56.4L48 61.5H37L23.8 29.4Z"
        fill="url(#wiragroWFill)"
        stroke="#E5D8AB"
        strokeWidth="0.9"
      />
      <path
        d="M72.2 29.4H58.3L53.6 49.1L48.5 29.4H39.6L48 61.5H59L72.2 29.4Z"
        fill="url(#wiragroWFill)"
        stroke="#E5D8AB"
        strokeWidth="0.9"
      />

      <path
        d="M51.8 18.4C58 22.6 61.1 28.4 61.1 35.9C61.1 40 59.9 43.8 57.5 47.3C53.7 46.4 50.7 44.4 48.6 41.3C48.2 44.8 46.2 47.5 42.6 49.5C39.3 45.6 37.7 41.4 37.7 36.8C37.7 29.5 42.4 23.4 51.8 18.4Z"
        fill="url(#wiragroLeafMain)"
        stroke="#E7F16A"
        strokeWidth="0.7"
      />
      <path
        d="M36.1 28.7C42.3 29.7 46.8 32.6 49.4 37.6C50.8 40.2 51.3 42.9 51.1 45.7C47.1 45.4 43.8 43.9 41.2 41.1C41.1 43.8 39.9 46 37.4 47.8C34.4 44.7 32.8 41.4 32.8 37.7C32.8 34.1 33.9 31.1 36.1 28.7Z"
        fill="url(#wiragroLeafSide)"
        stroke="#275C1D"
        strokeWidth="0.7"
      />
      <path
        d="M48.1 30.2V56.2"
        stroke="#24551A"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M48.1 40C45.3 38.3 43.2 36 41.8 33.1"
        stroke="#24551A"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
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
