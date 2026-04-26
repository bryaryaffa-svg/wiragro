import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { VideoCard } from "@/components/ui/video-card";
import { StorefrontCategoryNavigator } from "@/components/storefront-category-navigator";
import { getArticles, getCategories, getFallbackProductList, getProducts } from "@/lib/api";
import {
  buildEducationHref,
  filterEducationArticles,
  getFeaturedEducationVideos,
  type EducationFilterState,
} from "@/lib/education-content";
import { getProductRelationCards } from "@/lib/hybrid-navigation";
import {
  buildProductSolutionHref,
  buildSolutionHref,
  filterProductsForCatalog,
  getSolutionCropOptions,
  normalizeSolutionCropId,
  normalizeSolutionProblemId,
} from "@/lib/solution-experience";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
} from "@/lib/seo";
import { resolveStorefrontCategorySelection } from "@/lib/storefront-category-system";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  return typeof params[key] === "string" ? params[key] : undefined;
}

function buildProductsHref(
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `/produk?${query}` : "/produk";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const hasRefinement = Boolean(
    getParam(resolved, "q") ||
      getParam(resolved, "kategori") ||
      getParam(resolved, "tanaman") ||
      getParam(resolved, "masalah") ||
      getParam(resolved, "promo") ||
      getParam(resolved, "stok") ||
      getParam(resolved, "harga"),
  );

  return buildCatalogMetadata({
    title: hasRefinement ? "Hasil pencarian produk pertanian" : "Produk Pertanian - Wiragro",
    description: hasRefinement
      ? "Hasil pencarian produk pertanian Wiragro dengan konteks tanaman, masalah, dan kebutuhan lapangan."
      : "Belanja nutrisi tanaman, pestisida, benih, dan perlengkapan pertanian sesuai kebutuhan tanaman Anda.",
    path: "/produk",
    canonicalPath: "/produk",
    noIndex: hasRefinement,
    keywords: [
      "produk pertanian wiragro",
      "nutrisi tanaman",
      "pestisida",
      "benih",
      "alat pertanian",
      "solusi tanaman",
    ],
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const search = getParam(resolved, "q");
  const category = getParam(resolved, "kategori");
  const mainCategoryKey = getParam(resolved, "kelompok");
  const subcategory = getParam(resolved, "subkategori");
  const sort = getParam(resolved, "sort") ?? "latest";
  const cropId = normalizeSolutionCropId(getParam(resolved, "tanaman"));
  const problemId = normalizeSolutionProblemId(getParam(resolved, "masalah"));
  const priceBand = (getParam(resolved, "harga") ?? "all") as
    | "100k-250k"
    | "250k+"
    | "all"
    | "under-100k";
  const promoOnly = getParam(resolved, "promo") === "1";
  const stockOnly = getParam(resolved, "stok") === "1";

  const [categoriesResult, productsResult, articleResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ q: search, category_slug: category, sort, page_size: 60 }),
    getArticles({ q: search, page_size: 18 }),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const rawProducts =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : getFallbackProductList({ q: search, category_slug: category, sort, page_size: 60 });
  const articleFeed =
    articleResult.status === "fulfilled"
      ? articleResult.value
      : { items: [], pagination: { page: 1, page_size: 18, count: 0 } };
  const catalogUnavailable = productsResult.status === "rejected";
  const products = filterProductsForCatalog(rawProducts.items, {
    cropId: cropId ?? null,
    priceBand,
    problemId: problemId ?? null,
    promoOnly,
    stockOnly,
  });
  const activeCategory = categories.find((item) => item.slug === category);
  const storefrontSelection = resolveStorefrontCategorySelection({
    mainKey: mainCategoryKey,
    subLabel: subcategory,
    categorySlug: category,
    query: search,
  });
  const activeStorefrontMain = storefrontSelection.main;
  const quickProblemChips = [
    { label: "Untuk daun kuning", value: "daun-kuning" },
    { label: "Untuk hama", value: "hama" },
    { label: "Untuk pembungaan", value: "pembungaan-buruk" },
    { label: "Untuk buah rontok", value: "buah-rontok" },
    { label: "Untuk gulma", value: "gulma" },
    { label: "Untuk pertumbuhan", value: "pertumbuhan-lambat" },
  ];
  const cropChips = getSolutionCropOptions().slice(0, 8);

  const baseParams = {
    harga: priceBand !== "all" ? priceBand : undefined,
    kategori: category,
    kelompok: mainCategoryKey,
    masalah: problemId ?? undefined,
    promo: promoOnly ? "1" : undefined,
    q: search,
    sort,
    stok: stockOnly ? "1" : undefined,
    subkategori: subcategory,
    tanaman: cropId ?? undefined,
  };

  const educationFilters: EducationFilterState = {
    format: "all",
    masalah: problemId ?? undefined,
    q: search,
    tanaman: cropId ?? undefined,
  };
  const supportArticles = filterEducationArticles(articleFeed.items, educationFilters).slice(0, 3);
  const supportVideos = getFeaturedEducationVideos(educationFilters, 3);
  const supportArticleHref = buildEducationHref(educationFilters, {});
  const productSolutionHref = buildProductSolutionHref(cropId, problemId);
  const productContextLabel =
    cropId && problemId
      ? "Produk ini sudah dipersempit berdasarkan tanaman dan masalah yang sedang Anda tangani."
      : cropId
        ? "Produk ini dipersempit berdasarkan tanaman yang sedang Anda tangani."
        : problemId
          ? "Produk ini dipersempit berdasarkan masalah yang sedang Anda hadapi."
          : "Mulai dari masalah tanaman, lalu persempit dengan filter yang paling relevan.";

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            title: "Katalog Produk Pertanian Wiragro",
            description:
              "Produk pertanian Wiragro yang terhubung ke kebutuhan tanaman, gejala, dan keputusan budidaya.",
            path: "/produk",
            itemUrls: products.slice(0, 12).map((product) => `/produk/${product.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Produk", path: "/produk" },
          ]),
        ]}
        id="products-page-jsonld"
      />

      <section className="page-intro page-intro--compact">
        <span className="eyebrow-label">Produk berbasis solusi</span>
        <h1>Produk Pertanian Wiragro</h1>
        <p>
          Temukan nutrisi tanaman, pestisida, benih, dan perlengkapan pertanian
          dari masalah, tanaman, dan kebutuhan lapangan yang sedang Anda hadapi.
        </p>
        <div className="hub-hero__actions">
          <PrimaryButton href={buildSolutionHref(cropId, problemId)}>Mulai dari solusi</PrimaryButton>
          <SecondaryButton href={supportArticleHref}>Buka edukasi</SecondaryButton>
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          description="Jika kebutuhan Anda datang dari gejala tanaman, mulai dari masalah dan komoditas lebih dulu agar produk yang muncul terasa lebih relevan."
          eyebrow="Mulai dari masalah"
          title="Masuk ke produk dari konteks yang paling dekat dengan kondisi lapangan"
        />

        <div className="catalog-chip-row" aria-label="Masalah tanaman populer">
          {quickProblemChips.map((chip) => (
            <FilterChip
              active={problemId === chip.value}
              href={buildProductsHref({
                ...baseParams,
                masalah: chip.value === problemId ? undefined : chip.value,
              })}
              key={chip.value}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>

        <div className="catalog-chip-row" aria-label="Tanaman populer">
          {cropChips.map((chip) => (
            <FilterChip
              active={cropId === chip.id}
              href={buildProductsHref({
                ...baseParams,
                tanaman: chip.id === cropId ? undefined : chip.id,
              })}
              key={chip.id}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="catalog-shell">
        <div className="catalog-search-card">
          <SectionHeader
            description="Cari pupuk, pestisida, benih, hama, tanaman, atau kebutuhan budidaya lain untuk mempersempit hasil dengan cepat."
            eyebrow="Cari dan saring"
            title="Persempit pilihan produk tanpa kehilangan konteks"
          />

          <div className="catalog-search-card__primary">
            <SearchInput
              action="/produk"
              defaultValue={search}
              hiddenInputs={{
                harga: priceBand !== "all" ? priceBand : undefined,
                kategori: category,
                kelompok: mainCategoryKey,
                masalah: problemId ?? undefined,
                promo: promoOnly ? "1" : undefined,
                sort,
                stok: stockOnly ? "1" : undefined,
                subkategori: subcategory,
                tanaman: cropId ?? undefined,
              }}
              inputLabel="Cari produk pertanian"
              placeholder="Cari pupuk, pestisida, hama, tanaman, atau masalah..."
            />

            <form action="/produk" className="catalog-sort-form">
              <label className="catalog-search-card__field catalog-search-card__field--select">
                <span>Urutkan</span>
                <select defaultValue={sort} name="sort">
                  <option value="latest">Terbaru</option>
                  <option value="promo">Promo aktif</option>
                  <option value="best_seller">Terlaris</option>
                  <option value="name_asc">Nama A-Z</option>
                  <option value="price_asc">Harga termurah</option>
                  <option value="price_desc">Harga tertinggi</option>
                </select>
              </label>
              {Object.entries({
                harga: priceBand !== "all" ? priceBand : undefined,
                kategori: category,
                kelompok: mainCategoryKey,
                masalah: problemId ?? undefined,
                promo: promoOnly ? "1" : undefined,
                q: search,
                stok: stockOnly ? "1" : undefined,
                subkategori: subcategory,
                tanaman: cropId ?? undefined,
              }).map(([key, value]) =>
                value ? <input key={key} name={key} type="hidden" value={value} /> : null,
              )}
              <button className="btn btn-secondary" type="submit">
                Terapkan
              </button>
            </form>
          </div>

          <form action="/produk" className="catalog-filter-form">
            {Object.entries({
              kategori: category,
              kelompok: mainCategoryKey,
              q: search,
              sort,
              subkategori: subcategory,
            }).map(([key, value]) =>
              value ? <input key={key} name={key} type="hidden" value={value} /> : null,
            )}
            <label className="catalog-search-card__field">
              <span>Tanaman</span>
              <select defaultValue={cropId ?? ""} name="tanaman">
                <option value="">Semua tanaman</option>
                {getSolutionCropOptions().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalog-search-card__field">
              <span>Masalah</span>
              <select defaultValue={problemId ?? ""} name="masalah">
                <option value="">Semua masalah</option>
                <option value="daun-kuning">Daun kuning</option>
                <option value="hama">Hama</option>
                <option value="bercak-daun">Jamur / bercak</option>
                <option value="gulma">Gulma</option>
                <option value="pertumbuhan-lambat">Pertumbuhan lambat</option>
                <option value="buah-rontok">Buah rontok</option>
                <option value="pembungaan-buruk">Pembungaan buruk</option>
                <option value="hasil-panen">Hasil panen kurang maksimal</option>
              </select>
            </label>

            <label className="catalog-search-card__field">
              <span>Harga</span>
              <select defaultValue={priceBand} name="harga">
                <option value="all">Semua harga</option>
                <option value="under-100k">Di bawah 100 ribu</option>
                <option value="100k-250k">100 ribu - 250 ribu</option>
                <option value="250k+">Di atas 250 ribu</option>
              </select>
            </label>

            <label className="catalog-checkbox">
              <input defaultChecked={promoOnly} name="promo" type="checkbox" value="1" />
              <span>Promo</span>
            </label>

            <label className="catalog-checkbox">
              <input defaultChecked={stockOnly} name="stok" type="checkbox" value="1" />
              <span>Stok tersedia</span>
            </label>

            <div className="catalog-filter-form__actions">
              <button className="btn btn-secondary" type="submit">
                Terapkan filter
              </button>
              <a className="btn btn-secondary" href="/produk">
                Reset filter
              </a>
            </div>
          </form>

          <div className="catalog-chip-row" aria-label="Kategori produk">
            <FilterChip active={!category} href={buildProductsHref({ ...baseParams, kategori: undefined })}>
              Semua kategori
            </FilterChip>
            {categories.map((item) => (
              <FilterChip
                active={category === item.slug}
                href={buildProductsHref({ ...baseParams, kategori: item.slug })}
                key={item.id}
              >
                {item.name}
              </FilterChip>
            ))}
          </div>
        </div>

        <SectionHeader
          action={{ href: buildSolutionHref(cropId, problemId), label: "Masuk ke solusi", variant: "secondary" }}
          description={
            activeCategory
              ? `${productContextLabel} Kategori aktif: ${activeCategory.name}.`
              : activeStorefrontMain
                ? `${productContextLabel} Kategori aktif: ${activeStorefrontMain.label}.`
                : productContextLabel
          }
          eyebrow="Hasil produk"
          title={`${products.length} produk tersedia`}
        />

        {catalogUnavailable ? (
          <ErrorState
            actions={[
              { href: buildProductsHref(baseParams), label: "Coba lagi" },
              { href: buildSolutionHref(cropId, problemId), label: "Buka solusi", variant: "secondary" },
            ]}
            description="Silakan muat ulang atau masuk ke jalur solusi lebih dulu agar kebutuhan Anda tetap bisa dilanjutkan."
            eyebrow="Gagal memuat produk"
            title="Gagal memuat produk"
          />
        ) : products.length ? (
          <div className="product-grid product-grid--catalog">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            actions={[
              { href: "/produk", label: "Reset filter" },
              { href: buildSolutionHref(cropId, problemId), label: "Buka solusi", variant: "secondary" },
              { href: "/ai-chat", label: "Tanya AI", variant: "secondary" },
            ]}
            description="Coba ganti tanaman, masalah, atau masuk ke jalur solusi agar kebutuhan Anda lebih cepat dipersempit."
            eyebrow="Produk belum ditemukan"
            title="Produk belum ditemukan"
          />
        )}
      </section>

      {(supportArticles.length || supportVideos.length) ? (
        <section className="section-block">
          <SectionHeader
            action={{ href: supportArticleHref, label: "Buka edukasi", variant: "secondary" }}
            description="Belanja yang sehat tetap didahului konteks. Karena itu, katalog ini selalu punya jalan lanjut ke artikel dan video yang paling dekat."
            eyebrow="Belajar sebelum membeli"
            title="Edukasi dan video yang mendukung keputusan produk"
          />

          {supportVideos.length ? (
            <div className="education-video-grid">
              {supportVideos.map((video) => (
                <VideoCard
                  category={video.category}
                  ctaLabel={video.youtubeId ? "Tonton" : "Lihat panduan"}
                  description={video.description}
                  href={video.href}
                  key={video.id}
                  thumbnail={video.thumbnail}
                  title={video.title}
                />
              ))}
            </div>
          ) : null}

          {supportArticles.length ? (
            <div className="article-grid article-grid--editorial">
              {supportArticles.map((article) => (
                <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="section-block">
        <SectionHeader
          action={{ href: productSolutionHref, label: "Lihat semua produk", variant: "secondary" }}
          description="Kategori produk tetap tersedia untuk pengguna yang memang datang dengan kebutuhan yang sudah jelas, tetapi sekarang posisinya menjadi jalur sekunder setelah konteks masalah."
          eyebrow="Kategori produk"
          title="Masih ingin masuk dari kategori? Jalurnya tetap tersedia."
        />
        <StorefrontCategoryNavigator
          activeCategorySlug={category}
          activeMainKey={mainCategoryKey}
          activeQuery={search}
          activeSubcategory={subcategory}
          categories={categories}
        />
      </section>

      <PathwaySection
        cards={getProductRelationCards(undefined, activeCategory)}
        description="Katalog tetap fokus pada pembelian, tetapi setiap langkahnya mengantar user kembali ke konteks solusi dan edukasi."
        eyebrow="Relasi silang"
        title="Belanja yang sehat tetap terhubung ke masalah tanaman."
      />
    </section>
  );
}
