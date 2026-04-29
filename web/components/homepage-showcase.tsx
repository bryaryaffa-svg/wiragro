import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { AgriIcon } from "@/components/ui/agri-icon";
import { AgriScene } from "@/components/ui/agri-scene";
import { RoleAwarePrice } from "@/components/ui/role-aware-price";
import { formatDate } from "@/lib/format";
import type { ProductSummary } from "@/lib/api";
import {
  getFallbackProductVisual,
  getProductCardBadge,
  getProductCardFit,
} from "@/lib/product-card-content";
import { WIRAGRO_CATEGORY_ASSETS } from "@/lib/wiragro-assets";
import type {
  HomeHeroMetric,
  HomeIconCard,
  HomePartnerBenefit,
  HomeSeadanceVideoSlot,
  HomeTrustStripItem,
  HomeVideoCard,
} from "@/lib/homepage-content";

function getPrimaryProductImage(product: ProductSummary) {
  return product.images.find((image) => image.is_primary) ?? product.images[0] ?? null;
}

function pickHomepageArticleVisual(article: {
  taxonomy_labels?: string[];
  title: string;
}) {
  const haystack = `${article.title} ${(article.taxonomy_labels ?? []).join(" ")}`.toLowerCase();

  if (haystack.includes("benih") || haystack.includes("bibit")) {
    return WIRAGRO_CATEGORY_ASSETS.benih;
  }
  if (haystack.includes("pupuk") || haystack.includes("nutrisi")) {
    return WIRAGRO_CATEGORY_ASSETS.pupuk;
  }
  if (haystack.includes("hama") || haystack.includes("penyakit")) {
    return WIRAGRO_CATEGORY_ASSETS.pesticide;
  }
  if (haystack.includes("fase") || haystack.includes("persemaian")) {
    return WIRAGRO_CATEGORY_ASSETS.decorativeSeedling;
  }

  return WIRAGRO_CATEGORY_ASSETS.education;
}

export function HomepageHeroMetricCard({ item }: { item: HomeHeroMetric }) {
  return (
    <div className="homepage-hero-metric">
      <span className="homepage-hero-metric__icon">
        <AgriIcon name={item.icon} />
      </span>
      <div>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </div>
    </div>
  );
}

export function HomepageProblemCard({ card }: { card: HomeIconCard }) {
  return (
    <Link className="home-problem-card" href={card.href}>
      <div className="home-problem-card__media">
        <AgriScene
          assetFit={card.imageFit}
          assetSrc={card.thumbnail}
          className="home-problem-card__scene"
          mode="problem"
          name={card.icon}
        />
      </div>
      <div className="home-problem-card__body">
        <strong>{card.title}</strong>
        <p>{card.description}</p>
        <span>{card.actionLabel}</span>
      </div>
    </Link>
  );
}

export function HomepageCropTile({ card }: { card: HomeIconCard }) {
  return (
    <Link className="home-crop-tile" href={card.href}>
      <div className="home-crop-tile__visual">
        <AgriScene
          assetFit={card.imageFit}
          assetSrc={card.thumbnail}
          className="home-crop-tile__scene"
          mode="crop"
          name={card.icon}
        />
      </div>
      <strong>{card.title}</strong>
    </Link>
  );
}

export function HomepageMiniProductCard({ product }: { product: ProductSummary }) {
  const primaryImage = getPrimaryProductImage(product);
  const visual = primaryImage?.url ?? getFallbackProductVisual(product);
  const badge = getProductCardBadge(product);
  const fit = getProductCardFit(product);
  const useUnoptimizedImage = primaryImage?.url.startsWith("/") ?? visual.startsWith("/");

  return (
    <article className="home-mini-product-card">
      <Link className="home-mini-product-card__media" href={`/produk/${product.slug}`}>
        {badge ? <span className="home-mini-product-card__badge">{badge}</span> : null}
        <Image
          alt={primaryImage?.alt_text || product.name}
          fill
          sizes="(max-width: 768px) 44vw, 160px"
          src={visual}
          style={{ objectFit: "contain" }}
          unoptimized={useUnoptimizedImage}
        />
      </Link>
      <div className="home-mini-product-card__body">
        <span>{fit.categoryLabel}</span>
        <strong>{product.name}</strong>
        <div className="home-mini-product-card__fit" aria-label="Kecocokan produk">
          {fit.previewLabels.map((item) => (
            <span key={`${product.id}-${item}`}>{item}</span>
          ))}
        </div>
        <span className={`home-mini-product-card__stock home-mini-product-card__stock--${fit.stockState}`}>
          {fit.stockLabel}
        </span>
        <RoleAwarePrice compact availabilityText={null} price={product.price} />
        <div className="home-mini-product-card__actions">
          <Link className="btn btn-secondary btn-block" href={`/produk/${product.slug}`}>
            Lihat Detail
          </Link>
          <AddToCartButton
            buttonClassName="btn btn-primary btn-block"
            disabled={product.availability.state === "out_of_stock"}
            label="Tambah"
            productId={product.id}
          />
        </div>
      </div>
    </article>
  );
}

export function HomepageMiniVideoCard({ video }: { video: HomeVideoCard }) {
  const isIllustration =
    video.thumbnail.includes("/illustrations/") ||
    video.thumbnail.includes("/wiragro-illustrations/") ||
    video.thumbnail.endsWith(".svg");

  return (
    <Link className="home-mini-video-card" href={video.href}>
      <div className="home-mini-video-card__media">
        <Image
          alt={video.title}
          className={isIllustration ? "home-mini-video-card__image home-mini-video-card__image--illustration" : "home-mini-video-card__image"}
          fill
          sizes="(max-width: 768px) 44vw, 220px"
          src={video.thumbnail}
        />
        <span className="home-mini-video-card__play">
          <AgriIcon name="video" />
        </span>
        {video.duration ? <span className="home-mini-video-card__duration">{video.duration}</span> : null}
      </div>
      <div className="home-mini-video-card__body">
        <span>{video.category}</span>
        <strong>{video.title}</strong>
      </div>
    </Link>
  );
}

export function HomepageSeadanceVideoSlot({ video }: { video: HomeSeadanceVideoSlot }) {
  return (
    <article className="home-seadance-slot">
      <div className="home-seadance-slot__media">
        {video.videoSrc ? (
          <video
            aria-label={video.title}
            className="home-seadance-slot__video"
            controls
            poster={video.poster}
            preload="metadata"
          >
            <source src={video.videoSrc} />
          </video>
        ) : (
          <Image
            alt={video.title}
            className="home-seadance-slot__image"
            fill
            sizes="(max-width: 768px) 92vw, 520px"
            src={video.poster}
          />
        )}
        <span className="home-seadance-slot__play">
          <AgriIcon name="video" />
        </span>
      </div>
      <div className="home-seadance-slot__body">
        <span>{video.category}</span>
        <strong>{video.title}</strong>
        <p>{video.description}</p>
        <Link className="home-seadance-slot__action" href={video.href}>
          {video.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export function HomepageArticleList({
  articles,
}: {
  articles: Array<{
    excerpt?: string | null;
    published_at?: string | null;
    reading_time_minutes?: number;
    slug: string;
    taxonomy_labels?: string[];
    title: string;
  }>;
}) {
  return (
    <div className="home-article-list">
      {articles.map((article) => (
        <Link className="home-article-list__item" href={`/artikel/${article.slug}`} key={article.slug}>
          <div className="home-article-list__thumb">
            <Image
              alt={article.title}
              fill
              sizes="96px"
              src={pickHomepageArticleVisual(article)}
            />
          </div>
          <div className="home-article-list__copy">
            <strong>{article.title}</strong>
            <span>
              Edukasi
              {article.reading_time_minutes ? ` • ${article.reading_time_minutes} min baca` : ""}
              {!article.reading_time_minutes && article.published_at
                ? ` • ${formatDate(article.published_at)}`
                : ""}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HomepageAiMascot() {
  return (
    <div className="homepage-ai-mascot" aria-hidden="true">
      <div className="homepage-ai-mascot__panel">
        <Image
          alt=""
          className="homepage-ai-mascot__image"
          fill
          sizes="180px"
          src={WIRAGRO_CATEGORY_ASSETS.aiDiagnosis}
        />
        <div className="homepage-ai-mascot__readout">
          <span className="homepage-ai-mascot__readout-icon">
            <AgriIcon name="ai" />
          </span>
          <strong>AI siap bantu</strong>
          <small>Solusi awal</small>
        </div>
      </div>
    </div>
  );
}

export function HomepagePartnerBenefitCard({ item }: { item: HomePartnerBenefit }) {
  return (
    <div className="homepage-partner-benefit">
      <span className="homepage-partner-benefit__icon">
        <AgriIcon name={item.icon} />
      </span>
      <div>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </div>
    </div>
  );
}

export function HomepageTrustStripItemCard({ item }: { item: HomeTrustStripItem }) {
  return (
    <div className="homepage-trust-strip__item">
      <span className="homepage-trust-strip__icon">
        <AgriIcon name={item.icon} />
      </span>
      <div>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </div>
    </div>
  );
}
