export type AgriIconName =
  | "ai"
  | "article"
  | "chili"
  | "corn"
  | "distributor"
  | "education"
  | "empty"
  | "error"
  | "fruit-drop"
  | "fungus"
  | "grid"
  | "horti"
  | "leaf"
  | "melon"
  | "nutrition"
  | "onion"
  | "palm"
  | "pest"
  | "product"
  | "rice"
  | "root"
  | "solution"
  | "stunted"
  | "tomato"
  | "track"
  | "video"
  | "warning"
  | "weed"
  | "yellow-leaf";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AgriIcon({
  className,
  name,
}: {
  className?: string;
  name: AgriIconName;
}) {
  switch (name) {
    case "ai":
      return (
        <svg
          aria-hidden="true"
          className={joinClassNames("agri-icon", className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect x="5" y="7" width="14" height="11" rx="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.5 4.8v2.7M14.5 4.8v2.7M4 11.5h1.6M18.4 11.5H20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <circle cx="10" cy="12" r="1" fill="currentColor" />
          <circle cx="14" cy="12" r="1" fill="currentColor" />
          <path d="M9.2 15c.9.7 1.8 1 2.8 1 1 0 1.9-.3 2.8-1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "article":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H18v15.5A1.5 1.5 0 0 0 16.5 17H8.5A2.5 2.5 0 0 0 6 19.5V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 8h5.5M9 11.5h5.5M9 15h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "chili":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M14.5 6.2c1.8-.8 3.1-.6 4.3.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M7.6 8.4c4.8-1.3 8.1 1.3 8.1 5.9 0 3.4-2.2 5.6-5.2 5.6-3.5 0-5.9-2.5-5.9-6 0-2 1-3.8 3-5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M10.6 5.5c1.3.6 2.2 1.7 2.7 3.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "corn":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 4.5c2.8 1.8 4.5 4.5 4.5 8 0 4-2 6.5-4.5 7.8-2.5-1.3-4.5-3.8-4.5-7.8 0-3.5 1.7-6.2 4.5-8Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v10M9.6 8.4l-1.7 3.1M14.4 8.4l1.7 3.1M9.6 12.8l-1.7 3M14.4 12.8l1.7 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case "distributor":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M4.5 18.5h15M5.5 18.5v-7.8l4-2.5 2.7 2.1 6.3-3.8v12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9.5 18.5V13M14.5 18.5v-4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "education":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="m4.5 9 7.5-4 7.5 4-7.5 4-7.5-4Zm2 1.1v4.3c0 1.4 2.4 3.1 5.5 3.1s5.5-1.7 5.5-3.1v-4.3" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "empty":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <rect x="5" y="6" width="14" height="12" rx="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 11.5h7M8.5 14.5h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "error":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 5.2 19.5 18H4.5L12 5.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M12 10v3.6M12 16.6h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "fruit-drop":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M11.8 6c3.6 0 5.7 2.4 5.7 5.8 0 3.8-2.4 6.7-5.7 6.7-3.3 0-5.7-2.9-5.7-6.7C6.1 8.4 8.2 6 11.8 6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 5.5c0-1.2.5-2.1 1.5-3M8.7 14.8l1.8 1.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "fungus":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M7 10c0-3 2.2-5 5-5s5 2 5 5H7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M12 10v6M9.3 18h5.4M9.5 14.5h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "grid":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <rect x="4.5" y="4.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="4.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="4.5" y="14" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "horti":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 5.5c3.8 0 6.5 2.6 6.5 6.2 0 3.8-2.8 6.8-6.5 6.8s-6.5-3-6.5-6.8c0-3.6 2.7-6.2 6.5-6.2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 5V2.8M8.8 9.1l6.4 6.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "leaf":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M18.8 5.5c-7 .2-12 4.2-12 10 0 2.6 1.8 4.7 4.5 4.7 6 0 8.8-6 7.5-14.7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 16c2-2.6 4.8-4.8 8.2-6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "melon":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12.5" r="6.3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 6.2V18.8M8.2 7.7c1.8 1.7 2.7 3.3 3 4.8M15.8 7.7c-1.8 1.7-2.7 3.3-3 4.8M7.6 12.5h8.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
    case "nutrition":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M8 5.5h8M9 4v5M15 4v5M7.2 9.2h9.6l-.8 8.1a2 2 0 0 1-2 1.8H10a2 2 0 0 1-2-1.8l-.8-8.1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "onion":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 4.2c2.8 2.1 4.5 4.5 4.5 7.6 0 3.8-2 7-4.5 8.2-2.5-1.2-4.5-4.4-4.5-8.2 0-3.1 1.7-5.5 4.5-7.6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.2 5.4c.7 1.2 1.6 2.1 2.8 2.9 1.2-.8 2.1-1.7 2.8-2.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "palm":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 7.5v11M12 7.5c-1.5-1.8-3.2-2.8-5.2-3.1M12 7.5c1.5-1.8 3.2-2.8 5.2-3.1M12 11c-2.2-.4-4.1.2-5.8 1.8M12 11c2.2-.4 4.1.2 5.8 1.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "pest":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <ellipse cx="12" cy="12.2" rx="3.4" ry="5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7V4.5M8 10.2 5.5 8.5M16 10.2l2.5-1.7M8.2 14.5 5.7 16.2M15.8 14.5l2.5 1.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "product":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M6 7.5h12l-1.1 8.2a2 2 0 0 1-2 1.7H9.1a2 2 0 0 1-2-1.7L6 7.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 7.5a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "rice":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M11 6.5v11M13.5 8.2l4.2-2.1M13.5 11.2l4.2-.9M13.5 14.2l4.2.4M13.5 17.2l4.2 1.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M10.8 7.5 7 9.3M10.8 10.6 7 11.4M10.8 13.7 7 14.3M10.8 16.8 7 18.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "root":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 4.2v6.1M12 10.3c-2 1.2-3.1 2.9-3.1 5.1M12 10.3c2 1.2 3.1 2.9 3.1 5.1M8.9 15.4 7.5 19M15.1 15.4l1.4 3.6M12 15.4V20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M9 6.8c1.1-1 2-1.6 3-1.8 1 .2 1.9.8 3 1.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "solution":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4M8.8 11.1h4.4M11 8.8v4.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "stunted":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 18.8V10.2M12 10.2c-1.1-1.9-2.4-2.9-4.1-3.1M12 10.2c1.1-1.9 2.4-2.9 4.1-3.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M7 18.8h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M9.2 14.5h5.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "tomato":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="13" r="5.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7c.9-1.3 2-2.1 3.4-2.4M12 7c-.9-1.3-2-2.1-3.4-2.4M8.5 8.5 12 7l3.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "track":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M6.5 8.5h11v7.5h-11z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M6.5 10.5 12 13l5.5-2.5M12 13v3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "video":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <rect x="4.5" y="6" width="12.5" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="m18 9.2 2.5-1.6v8.8L18 14.8" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m10.2 10.1 3.8 2.2-3.8 2.2v-4.4Z" fill="currentColor" />
        </svg>
      );
    case "warning":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 5.2 19.5 18H4.5L12 5.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M12 10v3.6M12 16.6h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "weed":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M12 19V9.5M12 9.5c-1.5-1.9-3.1-2.9-4.8-3.1M12 9.5c1.5-1.9 3.1-2.9 4.8-3.1M12 13.2c-2.3-.6-4.4-.1-6.2 1.5M12 13.2c2.3-.6 4.4-.1 6.2 1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "yellow-leaf":
      return (
        <svg aria-hidden="true" className={joinClassNames("agri-icon", className)} fill="none" viewBox="0 0 24 24">
          <path d="M18.8 5.5c-7 .2-12 4.2-12 10 0 2.6 1.8 4.7 4.5 4.7 6 0 8.8-6 7.5-14.7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 16c2-2.6 4.8-4.8 8.2-6.5M8.2 18.2l2.3-2.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
  }
}
