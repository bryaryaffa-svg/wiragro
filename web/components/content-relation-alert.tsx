import Link from "next/link";

import type { ContentRelationIssue } from "@/lib/content-reference-catalog";

function getKindLabel(kind: ContentRelationIssue["kind"]) {
  switch (kind) {
    case "article":
      return "artikel";
    case "solution":
      return "solusi";
    case "bundle":
      return "bundle";
    case "product":
      return "produk";
    case "campaign":
      return "campaign";
    case "commodity":
      return "komoditas";
    case "stage":
      return "fase";
    default:
      return "konten";
  }
}

export function ContentRelationAlert({
  items,
  title = "Relasi konten sedang dilengkapi",
  href,
  actionLabel,
}: {
  items: ContentRelationIssue[];
  title?: string;
  href?: string;
  actionLabel?: string;
}) {
  if (!items.length) {
    return null;
  }

  const summary = items.map((item) => `${getKindLabel(item.kind)}: ${item.slug}`).join(", ");

  return (
    <article className="content-relation-alert">
      <span className="eyebrow-label">Info konten terkait</span>
      <strong>{title}</strong>
      <p>
        Beberapa referensi pendukung belum siap ditampilkan: {summary}. Halaman utama ini tetap
        bisa dipakai, dan tautan terkait akan dilengkapi bertahap.
      </p>
      {href && actionLabel ? (
        <Link className="content-relation-alert__action" href={href}>
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
