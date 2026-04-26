import Link from "next/link";

import type { EducationVideoResource } from "@/lib/education-content";

export function VideoMiniCard({ video }: { video: EducationVideoResource }) {
  return (
    <article className="chat-mini-card">
      <div className="chat-mini-card__body">
        <span className="eyebrow-label">{video.category}</span>
        <strong>{video.title}</strong>
        <p>{video.summary}</p>
        <Link className="btn btn-secondary" href={video.href}>
          {video.youtubeId ? "Tonton" : "Lihat panduan"}
        </Link>
      </div>
    </article>
  );
}
