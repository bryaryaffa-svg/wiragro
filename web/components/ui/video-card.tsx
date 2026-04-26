import Image from "next/image";
import Link from "next/link";

import { AgriIcon } from "@/components/ui/agri-icon";
import { trackUiEvent } from "@/lib/analytics";

export function VideoCard({
  category,
  ctaLabel = "Lihat studi kasus",
  description,
  href,
  thumbnail,
  title,
}: {
  category: string;
  ctaLabel?: string;
  description: string;
  href: string;
  thumbnail: string;
  title: string;
}) {
  return (
    <article className="video-card">
      <Link
        className="video-card__media"
        href={href}
        onClick={() =>
          trackUiEvent("watch_video", {
            title,
          })
        }
      >
        <Image alt={title} fill sizes="(max-width: 768px) 92vw, 32vw" src={thumbnail} />
        <span className="video-card__play">
          <AgriIcon name="video" />
        </span>
      </Link>
      <div className="video-card__body">
        <span className="eyebrow-label">{category}</span>
        <strong>{title}</strong>
        <p>{description}</p>
        <Link
          className="video-card__action"
          href={href}
          onClick={() =>
            trackUiEvent("watch_video", {
              title,
            })
          }
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
