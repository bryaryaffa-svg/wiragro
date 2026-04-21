import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ProductCard } from "@/components/product-card";
import {
  type ArticleListPayload,
  type ProductSummary,
  getArticles,
  getFallbackHomeData,
  getHomeData,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type DecorativeGlyphKind =
  | "sprout"
  | "route"
  | "spark"
  | "compass"
  | "parcel"
  | "signal";

function DecorativeGlyph({ kind }: { kind: DecorativeGlyphKind }) {
  switch (kind) {
    case "sprout":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M12 20V11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path
            d="M12 12C8.8 12 6.5 9.8 6 6c3.8.2 6 2.5 6 6Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M12 15c.1-3.4 2.1-5.6 5.9-6.3.3 3.7-1.6 6-5.9 6.3Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "route":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 7h3a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3h3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <circle cx="5" cy="7" fill="currentColor" r="1.5" />
          <circle cx="19" cy="16" fill="currentColor" r="1.5" />
          <path d="M14 6l2-2 2 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "spark":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="m12 3 1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M19 3v3M20.5 4.5h-3M4 16v3M5.5 17.5h-3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "compass":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9 15 2.4-6 6-2.4-2.4 6L9 15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <circle cx="12" cy="12" fill="currentColor" r="1.2" />
        </svg>
      );
    case "parcel":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m5 7 7 4 7-4M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "signal":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M5 18a10 10 0 0 1 14 0M8 14a6 6 0 0 1 8 0M11 10a2 2 0 0 1 2 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <circle cx="12" cy="18" fill="currentColor" r="1.6" />
        </svg>
      );
  }
}

function getPrimaryImage(product: ProductSummary | null | undefined) {
  return product?.images.find((image) => image.is_primary) ?? product?.images[0] ?? null;
}

type CuratedScene = {
  key: string;
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
};

const curatedScenes: CuratedScene[] = [
  {
    key: "field-sunrise",
    src: "/illustrations/agri-field-sunrise.svg",
    alt: "Ilustrasi hamparan sawah dan lahan hijau saat matahari terbit.",
    eyebrow: "Hamparan lahan",
    title: "Musim tanam, pupuk, dan ritme panen terasa dari layar pertama.",
    body: "Visual lahan dipakai sebagai anchor agar toko langsung terbaca sebagai storefront pertanian.",
  },
  {
    key: "logistics-hub",
    src: "/illustrations/agri-logistics-hub.svg",
    alt: "Ilustrasi toko pertanian dengan stok karung dan kendaraan pengiriman.",
    eyebrow: "Gudang dan distribusi",
    title: "Belanja kios, pickup, dan delivery tampil sebagai satu ekosistem.",
    body: "Bukan sekadar katalog, tetapi alur stok, pengambilan, dan kirim yang terasa nyata.",
  },
  {
    key: "seedling-lab",
    src: "/illustrations/agri-seedling-lab.svg",
    alt: "Ilustrasi baki semai, bibit muda, dan kebutuhan perawatan tanaman.",
    eyebrow: "Bibit dan perawatan",
    title: "Benih, nutrisi, dan edukasi produk diberi konteks visual yang lebih meyakinkan.",
    body: "Orang langsung menangkap bahwa toko ini hidup di dunia pertanian, bukan marketplace generik.",
  },
];

const photoScenes: CuratedScene[] = [
  {
    key: "field-dusk-photo",
    src: "https://images.unsplash.com/photo-1760635230940-853ec5ce0806?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    alt: "Foto hamparan lahan pertanian luas di bawah langit mendung saat senja.",
    eyebrow: "Hamparan lahan",
    title: "Lansekap pertanian yang nyata membuat storefront terasa lebih premium sejak layar pertama.",
    body: "Bidang foto besar membantu identitas toko langsung terbaca sebagai kanal belanja pertanian, bukan katalog generik.",
  },
  {
    key: "produce-market-photo",
    src: "https://images.unsplash.com/photo-1698909771914-de2863859dcd?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    alt: "Foto rak buah dan sayur segar di area jualan hasil panen.",
    eyebrow: "Etalase hasil panen",
    title: "Nuansa kios, hasil panen, dan stok dagang terasa lebih hidup dengan fotografi nyata.",
    body: "Foto retail pertanian memberi konteks visual bahwa toko ini menjual kebutuhan riil, bukan sekadar daftar item.",
  },
  {
    key: "greenhouse-worker-photo",
    src: "https://images.unsplash.com/photo-1762512216957-04c53ca12643?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    alt: "Foto pekerja sedang merawat tanaman di greenhouse.",
    eyebrow: "Perawatan tanaman",
    title: "Detail greenhouse dan perawatan tanaman membuat pengalaman belanja terasa lebih dekat ke dunia tani.",
    body: "Fotografi yang menampilkan aktivitas kerja di lapangan menambah rasa percaya dan kualitas pada homepage.",
  },
  {
    key: "seedling-hands-photo",
    src: "https://images.unsplash.com/photo-1763856957026-a74ab4f05891?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    alt: "Foto tangan menanam bibit kecil di tanah basah.",
    eyebrow: "Bibit dan tanam",
    title: "Close-up aktivitas tanam memberi sentuhan editorial yang lebih emosional dan meyakinkan.",
    body: "Ini memperkuat citra Sidomakmur sebagai storefront yang berakar pada kegiatan pertanian sehari-hari.",
  },
];

export default async function HomePage() {
  let home = getFallbackHomeData();
  let storefrontUnavailable = false;
  let articleFeed: ArticleListPayload = {
    items: [],
    pagination: { page: 1, page_size: 3, count: 0 },
  };

  try {
    home = await getHomeData();
  } catch {
    storefrontUnavailable = true;
  }

  try {
    articleFeed = await getArticles({ page_size: 3 });
  } catch {
    articleFeed = { items: [], pagination: { page: 1, page_size: 3, count: 0 } };
  }

  const heroFeature =
    home.featured_products[0] ?? home.new_arrivals[0] ?? home.best_sellers[0] ?? null;
  const heroFeatureImage = getPrimaryImage(heroFeature);
  const visualProducts = [
    heroFeature,
    ...home.featured_products,
    ...home.new_arrivals,
    ...home.best_sellers,
  ]
    .filter((product): product is ProductSummary => Boolean(product))
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);
  const visualFrames = visualProducts
    .map((product) => ({
      product,
      image: getPrimaryImage(product),
    }))
    .filter(
      (
        item,
      ): item is {
        product: ProductSummary;
        image: NonNullable<ReturnType<typeof getPrimaryImage>>;
      } => Boolean(item.image),
    );
  const heroTrail = visualFrames
    .filter((item) => item.product.id !== heroFeature?.id)
    .slice(0, 2);
  const atmosphereFrames = visualFrames.slice(0, 3);
  const heroBackdrop = heroFeatureImage
    ? {
        src: heroFeatureImage.url,
        alt: heroFeatureImage.alt_text || heroFeature?.name || "Sidomakmur storefront",
      }
    : {
        src: photoScenes[0].src,
        alt: photoScenes[0].alt,
      };
  const heroMedia = heroFeatureImage
    ? {
        src: heroFeatureImage.url,
        alt: heroFeatureImage.alt_text || heroFeature?.name || "Produk unggulan",
      }
    : {
        src: photoScenes[3].src,
        alt: photoScenes[3].alt,
      };
  const reelVisuals = [
    ...heroTrail.map(({ product, image }) => ({
      key: `product-${product.id}`,
      src: image.url,
      alt: image.alt_text || product.name,
      eyebrow: "Pilihan visual",
      title: product.name,
      body:
        product.summary ||
        "Produk aktif di etalase Sidomakmur yang siap membantu kebutuhan belanja harian pelanggan.",
    })),
    ...photoScenes.slice(1, 3),
  ].slice(0, 2);
  const atmospherePanels = [
    ...atmosphereFrames.map(({ product, image }) => ({
      key: `atmosphere-${product.id}`,
      src: image.url,
      alt: image.alt_text || product.name,
      eyebrow: "Etalase hidup",
      title: product.name,
      body:
        product.summary ||
        "Produk inti dari katalog yang dipadukan dengan nuansa lahan, stok, dan perawatan tanaman.",
    })),
    ...photoScenes,
    ...curatedScenes,
  ].slice(0, 3);
  const serviceHighlights = [
    {
      icon: "sprout" as const,
      title: "Pencarian produk yang langsung ke inti kebutuhan",
      body: "Cari pupuk, benih, pestisida, dan kebutuhan kios dari katalog yang ditata untuk dipindai cepat.",
      scene: photoScenes[0],
    },
    {
      icon: "route" as const,
      title: "Checkout dan pelacakan pesanan yang lebih jelas",
      body: "Masukkan pesanan dengan alur yang rapi, lalu pantau status order tanpa berpindah-pindah halaman.",
      scene: photoScenes[1],
    },
    {
      icon: "spark" as const,
      title: "Edukasi produk sebagai pendamping keputusan beli",
      body: "Baca panduan singkat agar pelanggan bisa memilih produk yang lebih tepat sebelum checkout.",
      scene: photoScenes[2],
    },
  ];
  const heroSignals = [
    {
      icon: "route" as const,
      title: "Pickup dan delivery",
      body: "Alur checkout menyesuaikan ritme belanja pelanggan, dari pengambilan cepat sampai kirim terjadwal.",
    },
    {
      icon: "parcel" as const,
      title: "Katalog terasa nyata",
      body: "Foto produk jadi anchor utama agar storefront terasa seperti etalase hidup, bukan daftar statis.",
    },
    {
      icon: "signal" as const,
      title: "Selalu mudah dipantau",
      body: "Dari pencarian sampai lacak pesanan, semua bergerak dalam satu sistem yang konsisten.",
    },
  ];
  const atmosphereNotes = [
    {
      icon: "compass" as const,
      title: "Arah visual lebih tegas",
      body: "Beranda sekarang dibangun dari bidang gambar besar, tekstur lembut, dan kontras yang lebih premium.",
    },
    {
      icon: "sprout" as const,
      title: "Dekorasi yang punya peran",
      body: "Ornamen garis, glyph pertanian, dan motion halus dipakai untuk membangun suasana tanpa mengganggu scanability.",
    },
    {
      icon: "spark" as const,
      title: "Tetap operasional",
      body: "Walau lebih modern, flow inti tetap cepat: cari produk, buka detail, checkout, lalu lacak pesanan.",
    },
  ];
  const mobileHeroUtilities = [
    {
      label: "Jam toko",
      value: home.store.operational_hours || "Operasional aktif",
    },
    {
      label: "Kategori",
      value: `${home.category_highlights.length} kategori inti`,
    },
    {
      label: "Layanan",
      value: "Pickup & delivery",
    },
    {
      label: "Pelacakan",
      value: "Status order cepat",
    },
  ];
  const fallbackEditorial = [
    {
      slug: "panduan-memilih-pupuk",
      title: "Panduan memilih pupuk sesuai kebutuhan tanaman",
      excerpt:
        "Mulai dari pemupukan dasar, penguatan akar, sampai kebutuhan nutrisi lanjutan untuk lahan yang berbeda.",
      published_at: null,
    },
    {
      slug: "dasar-memilih-benih",
      title: "Cara membaca kualitas benih sebelum membeli",
      excerpt:
        "Panduan cepat untuk menilai benih, kesesuaian varietas, dan hal-hal yang perlu diperiksa sebelum checkout.",
      published_at: null,
    },
    {
      slug: "manajemen-belanja-toko",
      title: "Belanja kebutuhan kios dan pertanian dengan lebih efisien",
      excerpt:
        "Gabungkan kebutuhan toko, stok harian, dan produk inti pertanian dalam ritme belanja yang lebih tertata.",
      published_at: null,
    },
  ];
  const editorialFeed = articleFeed.items.length ? articleFeed.items : fallbackEditorial;
  const heroPrice = heroFeature ? formatCurrency(heroFeature.price.amount) : null;

  return (
    <div className="page-stack page-stack--home">
      <section className="home-hero home-section home-section--hero">
        <div className="home-hero__backdrop">
          <Image alt={heroBackdrop.alt} fill priority sizes="100vw" src={heroBackdrop.src} />
        </div>
        <div className="home-hero__veil" aria-hidden="true" />
        <div className="home-hero__ornaments" aria-hidden="true">
          <div className="home-hero__orbit home-hero__orbit--north">
            <DecorativeGlyph kind="spark" />
          </div>
          <div className="home-hero__orbit home-hero__orbit--south">
            <DecorativeGlyph kind="route" />
          </div>
          <div className="home-hero__orbit home-hero__orbit--east">
            <DecorativeGlyph kind="sprout" />
          </div>
        </div>
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <span className="eyebrow-label">Wiragro / Sidomakmur</span>
            <p className="home-hero__kicker">Katalog pertanian dan kebutuhan kios</p>
            <h1>Belanja pertanian yang cepat, rapi, dan siap kirim.</h1>
            <p>
              Cari pupuk, benih, pestisida, dan kebutuhan kios dalam satu storefront
              yang lebih mudah dipindai dari mobile maupun web.
            </p>
            <div className="home-hero__actions">
              <Link className="btn btn-primary" href="/produk">
                Jelajahi katalog
              </Link>
              <Link className="btn btn-secondary" href="/lacak-pesanan">
                Lacak pesanan
              </Link>
            </div>
            <div className="home-mobile-utilities">
              {mobileHeroUtilities.map((item) => (
                <article className="home-mobile-utility" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <form action="/produk" className="header-search header-search--hero home-hero__search">
              <input
                name="q"
                placeholder="Cari pupuk, benih, pestisida, nutrisi, atau kebutuhan toko"
                type="search"
              />
              <button type="submit">Cari</button>
            </form>
            <ul className="home-hero__support">
              <li>
                <strong>{home.store.name}</strong>
                <span>{home.store.operational_hours || "Jam operasional tersedia"}</span>
              </li>
              <li>
                <strong>{home.category_highlights.length} kategori inti</strong>
                <span>Mulai dari pupuk, benih, sampai kebutuhan kios.</span>
              </li>
              <li>
                <strong>Checkout delivery atau pickup</strong>
                <span>Sesuaikan alur pesanan dengan kebutuhan pelanggan.</span>
              </li>
            </ul>
            <div className="home-hero__signals">
              {heroSignals.map((signal) => (
                <article className="hero-signal" key={signal.title}>
                  <span className="hero-signal__icon">
                    <DecorativeGlyph kind={signal.icon} />
                  </span>
                  <div>
                    <strong>{signal.title}</strong>
                    <p>{signal.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="home-hero__aside">
            <article className="home-hero__product">
              <div className="home-hero__media">
                <Image alt={heroMedia.alt} fill sizes="(max-width: 1024px) 100vw, 36vw" src={heroMedia.src} />
              </div>
              <div className="home-hero__card">
                <span className="eyebrow-label">Sorotan produk</span>
                <h2>{heroFeature?.name ?? "Produk unggulan dari katalog Sidomakmur"}</h2>
                <p>
                  {heroFeature?.summary ||
                    "Buka katalog untuk melihat produk yang paling sering dicari pelanggan dan siap diproses hari ini."}
                </p>
                <div className="home-hero__price">
                  <strong>{heroPrice ?? "Katalog aktif"}</strong>
                  <span>
                    {heroFeature?.availability.label || "Produk dan harga diperbarui dari katalog toko."}
                  </span>
                </div>
                <Link
                  className="btn btn-secondary"
                  href={heroFeature ? `/produk/${heroFeature.slug}` : "/produk"}
                >
                  Lihat detail produk
                </Link>
              </div>
            </article>

            {reelVisuals.length ? (
              <div className="home-hero__reel">
                {reelVisuals.map((item) => (
                  <article className="home-hero__reel-card" key={item.key}>
                    <div className="home-hero__reel-media">
                      <Image alt={item.alt} fill sizes="(max-width: 1024px) 100vw, 18vw" src={item.src} />
                    </div>
                    <div className="home-hero__reel-copy">
                      <span className="eyebrow-label">{item.eyebrow}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <ul className="home-hero__metrics">
              <li>
                <span>Produk unggulan</span>
                <strong>{home.featured_products.length}</strong>
              </li>
              <li>
                <span>Produk baru</span>
                <strong>{home.new_arrivals.length}</strong>
              </li>
              <li>
                <span>Banner aktif</span>
                <strong>{home.banners.length}</strong>
              </li>
              <li>
                <span>Operasional toko</span>
                <strong>{home.store.operational_hours || "Sesuai jam cabang"}</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--tight home-section home-section--proof">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Layanan inti</span>
            <h2>Belanja cepat lewat katalog, checkout, dan edukasi yang rapi.</h2>
          </div>
        </div>
        <div className="home-proof-grid">
          {serviceHighlights.map((item, index) => (
            <article className="home-proof" key={item.title}>
              <div className="home-proof__media">
                <Image alt={item.scene.alt} fill sizes="(max-width: 1080px) 100vw, 28vw" src={item.scene.src} />
                <div className="home-proof__overlay">
                  <span className="home-proof__index">0{index + 1}</span>
                  <span className="home-proof__label">{item.scene.eyebrow}</span>
                </div>
              </div>
              <div className="home-proof__content">
                <span className="home-proof__glyph">
                  <DecorativeGlyph kind={item.icon} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell section-shell--soft home-section home-section--atmosphere">
        <div className="home-atmosphere">
          <div className="home-atmosphere__visual">
            <article className="home-atmosphere__panel home-atmosphere__panel--lead">
              <Image alt={atmospherePanels[0].alt} fill sizes="(max-width: 1024px) 100vw, 32vw" src={atmospherePanels[0].src} />
              <div className="home-atmosphere__overlay">
                <span className="eyebrow-label">{atmospherePanels[0].eyebrow}</span>
                <strong>{atmospherePanels[0].title}</strong>
              </div>
            </article>
            <div className="home-atmosphere__stack">
              {atmospherePanels.slice(1).map((panel) => (
                <article className="home-atmosphere__panel home-atmosphere__panel--stacked" key={panel.key}>
                  <Image alt={panel.alt} fill sizes="(max-width: 1024px) 100vw, 16vw" src={panel.src} />
                  <div className="home-atmosphere__overlay">
                    <span className="eyebrow-label">{panel.eyebrow}</span>
                    <strong>{panel.title}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="home-atmosphere__copy">
            <span className="eyebrow-label">Arah visual baru</span>
            <h2>Storefront sekarang berbicara lewat lahan, bibit, dan stok yang nyata.</h2>
            <p>
              Bahkan saat foto produk belum lengkap, homepage tetap punya identitas pertanian yang
              kuat lewat bidang gambar besar, ilustrasi editorial, dan ritme visual yang lebih hidup.
            </p>
            <div className="home-atmosphere__notes">
              {atmosphereNotes.map((note) => (
                <article className="home-atmosphere__note" key={note.title}>
                  <span className="home-atmosphere__note-icon">
                    <DecorativeGlyph kind={note.icon} />
                  </span>
                  <div>
                    <strong>{note.title}</strong>
                    <p>{note.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {storefrontUnavailable ? (
        <section className="section-shell section-shell--soft home-section home-section--system">
          <div className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Koneksi katalog sedang bermasalah</span>
            <h2>Homepage tetap aktif, tetapi data produk belum berhasil dimuat.</h2>
            <p>
              Coba muat ulang halaman beberapa saat lagi. Jika perlu, buka katalog lagi
              setelah koneksi server kembali stabil.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Buka katalog
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {home.banners.length ? (
        <section className="section-shell section-shell--soft home-section home-section--banner">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Informasi toko</span>
              <h2>Promo dan info toko yang perlu terlihat sekarang.</h2>
            </div>
          </div>
          <div className="notice-list">
            {home.banners.map((banner) => (
              <article className="notice-item" key={`${banner.title}-${banner.target_url ?? "no-link"}`}>
                <div>
                  <span className="eyebrow-label">Update</span>
                  <strong>{banner.title}</strong>
                  <p>{banner.subtitle || "Informasi aktif dari dashboard toko."}</p>
                </div>
                {banner.target_url ? (
                  <Link className="btn btn-secondary" href={banner.target_url}>
                    Buka detail
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-shell home-section home-section--categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kategori utama</span>
            <h2>Mulai dari kategori yang paling sering dicari pelanggan.</h2>
          </div>
          <Link href="/produk">Lihat semua kategori</Link>
        </div>
        <div className="category-rail">
          {home.category_highlights.map((category) => (
            <Link className="category-rail__item" href={`/produk?kategori=${category.slug}`} key={category.slug}>
              <span className="eyebrow-label">Kategori</span>
              <strong>{category.name}</strong>
              <p>Buka daftar produk {category.name.toLowerCase()}.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell home-section home-section--featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pilihan unggulan</span>
            <h2>Pilihan unggulan untuk isi stok dan belanja cepat.</h2>
          </div>
          <Link href="/produk">Lihat semua</Link>
        </div>
        <div className="product-grid">
          {home.featured_products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell section-shell--soft home-section home-section--editorial">
        <div className="split-section">
          <div className="split-section__copy">
            <span className="eyebrow-label">Edukasi & insight</span>
            <h2>Panduan singkat sebelum memilih produk.</h2>
            <p>
              Artikel dipakai sebagai area edukasi singkat untuk produk, penggunaan dasar,
              dan pengambilan keputusan yang lebih percaya diri.
            </p>
            <Link className="btn btn-secondary" href="/artikel">
              Buka halaman edukasi
            </Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {editorialFeed.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell home-section home-section--new">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk terbaru</span>
            <h2>Tambahan katalog terbaru di Sidomakmur.</h2>
          </div>
        </div>
        <div className="product-grid">
          {home.new_arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell home-section home-section--best">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk terlaris</span>
            <h2>Produk yang paling sering dipesan.</h2>
          </div>
          <Link href="/produk?sort=best_seller">Lihat katalog</Link>
        </div>
        <div className="product-grid">
          {home.best_sellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-cta home-section home-section--cta">
        <div>
          <span className="eyebrow-label">Mulai belanja</span>
          <h2>Buka katalog atau langsung lacak pesanan.</h2>
          <p>
            Kalau kebutuhan sudah jelas, buka katalog. Kalau nomor order sudah ada,
            langsung lanjut ke halaman pelacakan.
          </p>
        </div>
        <div className="home-cta__actions">
          <Link className="btn btn-primary" href="/produk">
            Buka katalog
          </Link>
          <Link className="btn btn-secondary" href="/lacak-pesanan">
            Lacak order
          </Link>
        </div>
      </section>
    </div>
  );
}
