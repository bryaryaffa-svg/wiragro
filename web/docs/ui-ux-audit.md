# UI/UX Audit Frontend Web Wiragro

Tanggal audit: 2026-04-26

Scope: pembacaan struktur `web/app`, `web/components`, `web/lib`, `web/app/globals.css`, dan `web/app/design-system.css`. Audit ini belum mengubah production UI atau logic.

## Ringkasan Eksekutif

Frontend web Wiragro sudah membentuk pengalaman hybrid yang jelas: pengguna bisa mulai dari masalah tanaman, belajar dari edukasi, menemukan produk, checkout, lalu melacak pesanan dan repeat order melalui akun/wishlist. Struktur App Router dan komponen shared sudah cukup matang untuk redesign bertahap.

Masalah utama sebelum redesign bukan kekurangan fitur, tetapi kepadatan funnel. Banyak halaman sudah mencoba menghubungkan edukasi, solusi, produk, AI, WhatsApp, B2B, bundle, dan campaign sekaligus. Ini kuat untuk SEO dan discovery, tetapi di mobile berisiko membuat user lapangan sulit memilih tindakan pertama.

Prioritas redesign sebaiknya:

- P0: kurangi friction pada katalog produk, detail produk, cart, checkout, dan login.
- P1: rapikan information architecture antara `Solusi`, `Produk`, `Edukasi`, search, AI, bundle, campaign, dan B2B.
- P2: stabilkan design system/CSS agar redesign tidak menyentuh terlalu banyak selector global.

## Struktur Frontend

### App Shell

- `web/app/layout.tsx`
  - Mengatur font lokal Manrope/Fraunces.
  - Import `globals.css` dan `design-system.css`.
  - Membungkus semua halaman dengan `AuthProvider`, `CartProvider`, `WishlistProvider`.
  - Menampilkan `SiteHeader`, `SiteFooter`, dan `MobileBottomNav` di semua route.
  - Menyisipkan JSON-LD global dan runtime config.

### Folder Route `web/app`

Route utama memakai Next.js App Router. Banyak halaman dinamis diberi `dynamic = "force-dynamic"` karena mengambil data storefront/customer secara live.

Kelompok route:

- Beranda: `/`
- Solusi: `/solusi`, `/solusi/[taxonomy]`, `/solusi/[taxonomy]/[slug]`, `/solusi/masalah/[slug]`
- Produk/katalog: `/produk`, `/produk/[slug]`
- Edukasi/artikel: `/artikel`, `/artikel/[slug]`, `/belajar`, `/belajar/[taxonomy]`, `/belajar/[taxonomy]/[slug]`, `/edukasi`
- Belanja komersial: `/belanja`, `/belanja/paket`, `/belanja/paket/[slug]`, `/kampanye`, `/kampanye/[slug]`, `/b2b`
- Komoditas: `/komoditas`, `/komoditas/[slug]`
- Commerce utility: `/keranjang`, `/checkout`, `/wishlist`, `/lacak-pesanan`
- Akun/auth: `/masuk`, `/login`, `/akun`
- Search/AI: `/cari`, `/ai-chat`
- Static pages: `/faq`, `/kontak`, `/tentang-kami`, `/pengiriman-pembayaran`, `/garansi-retur`, `/kebijakan-privasi`, `/syarat-dan-ketentuan`, `/migrasi-situs`

### Komponen Shared `web/components`

Komponen shell dan navigasi:

- `app-header.tsx`
- `site-header.tsx`
- `site-footer.tsx`
- `mobile-bottom-nav.tsx`
- `global-search.tsx`
- `mobile-search-overlay.tsx`
- `wiragro-lockup.tsx`

Komponen commerce:

- `product-card.tsx`
- `product-detail-view.tsx`
- `product-mini-card.tsx`
- `product-review-section.tsx`
- `cart/cart-provider.tsx`
- `cart/cart-page-client.tsx`
- `cart/add-to-cart-button.tsx`
- `cart/buy-now-button.tsx`
- `checkout-form.tsx`
- `wishlist-provider.tsx`
- `wishlist-button.tsx`
- `wishlist-page-client.tsx`
- `order-tracker.tsx`
- `reorder-order-button.tsx`
- `minimum-order-notice.tsx`
- `role-aware-price.tsx`

Komponen edukasi/solusi/hybrid:

- `article-card.tsx`
- `article-mini-card.tsx`
- `article-taxonomy-directory.tsx`
- `solution-card.tsx`
- `solution-result.tsx`
- `solution-taxonomy-directory.tsx`
- `problem-selector.tsx`
- `crop-selector.tsx`
- `pathway-section.tsx`
- `content-relation-alert.tsx`
- `commerce-intent-grid.tsx`
- `commerce-intent-link.tsx`
- `growth-bundle-card.tsx`
- `campaign-spotlight-card.tsx`
- `commodity-hub-card.tsx`

Komponen UI generik:

- `ui/button.tsx`
- `ui/section-header.tsx`
- `ui/search-input.tsx`
- `ui/filter-chip.tsx`
- `ui/state.tsx`
- `ui/step-wizard.tsx`
- `ui/sticky-mobile-cta.tsx`
- `ui/trust-badge.tsx`
- `ui/video-card.tsx`
- `ui/loading-skeleton.tsx`
- `ui/agri-icon.tsx`
- `ui/agri-scene.tsx`

### Lib/Data `web/lib`

Sumber data dan API:

- `api.ts`: kontrak payload storefront, customer, cart, checkout, shipping, wishlist, tracking order, review, B2B inquiry.
- `config.ts`, `runtime-config.ts`: URL API dan runtime public config.
- `seo.ts`: metadata, JSON-LD, canonical.
- `format.ts`, `maps.ts`, `analytics.ts`: helper umum.

Konten dan relasi:

- `homepage-content.ts`
- `article-content.ts`
- `education-content.ts`
- `solution-content.ts`
- `solution-experience.ts`
- `product-content.ts`
- `hybrid-navigation.ts`
- `content-relation-resolver.ts`
- `content-reference-catalog.ts`
- `commodity-content.ts`
- `campaign-content.ts`
- `growth-commerce.ts`
- `bundle-catalog.ts`
- `storefront-category-system.ts`
- `commercial-content/*`

Auth/commerce support:

- `account-role.ts`
- `distributor-checkout.ts`
- `commerce-tracking.ts`
- `global-search.ts`
- `ai-chat-adapter.ts`

### Style Global

- `web/app/globals.css`: sekitar 9452 baris.
- `web/app/design-system.css`: sekitar 4665 baris.

Catatan: kedua file sama-sama mendefinisikan token seperti `--bg`, `--surface`, `--primary`, `--radius-*`, `--container-width`, dan banyak selector global. `design-system.css` diimport setelah `globals.css`, sehingga banyak nilai token dan style override terjadi lewat cascade global.

## Peta Halaman dan Komponen

| Halaman | Route | Komponen utama | Data/lib utama | Catatan UX |
| --- | --- | --- | --- | --- |
| Homepage | `/` | `Homepage*`, `TrackedLinkButton`, `TrustBadge`, `StickyMobileCTA`, `ProductCard` mini | `getHomeData`, `homepage-content`, `article-content`, `seo` | Sudah menghubungkan masalah, tanaman, produk, edukasi, AI, dan trust. Risiko: terlalu banyak pintu masuk di first journey. |
| Solusi hub | `/solusi` | `CropSelector`, `ProblemSelector`, `StepWizard`, `SolutionResult`, `FilterChip` | `solution-experience`, `api`, `seo` | Alur masalah tanaman sudah kuat. Perlu pastikan wizard mobile menjadi jalur utama, bukan tenggelam oleh hero. |
| Solusi taxonomy | `/solusi/[taxonomy]`, `/solusi/[taxonomy]/[slug]` | `SolutionCard`, `SolutionTaxonomyDirectory`, `TaxonomyClusterGrid`, `ProductCard`, `ArticleCard` | `solution-content`, `content-relation-resolver` | Baik untuk SEO dan browsing. Risiko duplikasi mental model dengan `/solusi/masalah/[slug]`. |
| Detail masalah | `/solusi/masalah/[slug]` | `SolutionCard`, `ProductCard`, `GrowthBundleCard`, `CampaignSpotlightCard`, `B2BInquiryForm` | `solution-content`, `growth-commerce`, `campaign-content` | Bagus untuk bridge solusi ke commerce. Risiko CTA terlalu banyak untuk user baru. |
| Produk katalog | `/produk` | `SearchInput`, `FilterChip`, `StorefrontCategoryNavigator`, `ProductCard`, `PathwaySection`, `VideoCard`, `ArticleCard` | `api`, `solution-experience`, `education-content`, `storefront-category-system` | Katalog kaya konteks, tetapi action density tinggi dan filter cukup kompleks. |
| Detail produk | `/produk/[slug]` | `ProductDetailView`, `ProductReviewSection`, `CommerceIntentGrid`, `ProductCard`, `SolutionCard`, `GrowthBundleCard`, `B2BInquiryForm` | `api`, `product-content`, `growth-commerce`, `content-relation-resolver` | Detail edukatif dan transaksional kuat. Risiko: CTA beli/WA/B2B/AI bersaing. |
| Edukasi listing | `/artikel` | `SearchInput`, `FilterChip`, `ArticleCard`, `VideoCard`, `SectionHeader` | `api`, `education-content`, `solution-experience` | Sudah bisa filter berdasarkan tanaman/masalah/topik/format. Perlu bridge produk yang lebih jelas setelah user membaca/mencari. |
| Detail artikel | `/artikel/[slug]` | `ArticleCard`, `ProductCard`, `TrustBadge`, `VideoCard`, rich content | `api`, `article-content`, `education-content`, `solution-experience` | Struktur guide praktis baik. Risiko produk/solusi terkait muncul setelah banyak konten dan rich HTML bisa tidak konsisten. |
| Edukasi hub baru | `/belajar` | `ArticleTaxonomyDirectory`, `PathwaySection`, `VideoCard`, `ArticleCard` | `article-content`, `education-content`, `hybrid-navigation` | Lebih editorial daripada `/artikel`. Perlu keputusan IA: apakah ini canonical hub atau support hub. |
| Edukasi alias | `/edukasi` | Redirect ke `/artikel` | Next redirect | Alias membantu, tetapi perlu konsistensi label nav/SEO. |
| Belanja hub | `/belanja` | `CommerceIntentGrid`, `GrowthBundleCard`, `ProductCard`, `StorefrontCategoryDirectory`, `PathwaySection` | `growth-commerce`, `hybrid-navigation`, `api` | Menambah IA commerce di luar `/produk`. Risiko user bingung bedanya Belanja vs Produk. |
| Bundle hub/detail | `/belanja/paket`, `/belanja/paket/[slug]` | `GrowthBundleCard`, `BundlePurchaseActions`, `CommerceIntentGrid`, `B2BInquiryForm` | `growth-commerce`, `bundle-catalog` | Baik untuk repeat/order bundle. Perlu integrasi jelas dengan cart jika bundle bukan SKU native. |
| Campaign hub/detail | `/kampanye`, `/kampanye/[slug]` | `CampaignSpotlightCard`, `CommerceIntentGrid`, `GrowthBundleCard`, `ProductCard`, `SolutionCard` | `campaign-content`, `growth-commerce` | Cocok untuk seasonal commerce. Perlu guard agar tidak membuat nav commerce terlalu bercabang. |
| B2B | `/b2b` | `B2BInquiryForm`, `B2BInquiryStatusPanel`, `CommerceIntentGrid`, `ProofSignalGrid` | `growth-commerce`, `api` | Jalur volume besar sudah terpisah. Perlu keep distinct dari checkout retail. |
| Komoditas | `/komoditas`, `/komoditas/[slug]` | `CommodityHubCard`, `ProductCard`, `SolutionCard`, `GrowthBundleCard`, `CampaignSpotlightCard` | `commodity-content`, `campaign-content`, `solution-content` | Kuat untuk browsing berbasis tanaman. Perlu tautan eksplisit dari produk/solusi. |
| Keranjang | `/keranjang` | `CartPageClient`, `CartProvider`, `AddToCartButton`, `BuyNowButton` | `cart-provider`, `api`, `format` | Keranjang informatif. Risiko copy panjang dan checkout wajib login bisa menjadi friction. |
| Checkout | `/checkout` | `CheckoutForm`, `MinimumOrderNotice`, `GooglePlacesAddressAssist`, `PermissionCodeInput`, `TrustStrip` | `api`, `distributor-checkout`, `account-role`, `maps` | Fitur lengkap tetapi component sangat besar. UX checkout perlu dibuat step-by-step dan lebih tenang. |
| Login | `/masuk`, `/login` | `AccountPanel`, `GoogleSignInButton` | `auth-provider`, `analytics` | Dua route memakai panel sama. Perlu konsistensi route utama dan copy untuk checkout redirect. |
| Akun | `/akun` | `AccountPanel`, `AccountDashboard`, `ReorderOrderButton`, `OrderReviewActionGroup` | `api`, `auth-provider` | Ada repeat order/review potential. Perlu menonjolkan reorder dan order aktif. |
| Wishlist | `/wishlist` | `WishlistPageClient`, `ProductCard`, `WishlistProvider` | `wishlist-provider`, `auth-provider` | Bagus untuk repeat discovery. Perlu CTA batch "lanjut beli" atau quick add prioritas. |
| Tracking order | `/lacak-pesanan` | `OrderTracker`, `TrustStrip`, `OrderReviewActionGroup` | `api`, `format` | Bisa tanpa login, bagus. Risiko trust: "Pembaruan terakhir" memakai waktu sekarang, bukan timestamp order. |
| Search | `/cari` | `SearchInput`, `SearchResultTabs`, `FilterChip`, `SectionHeader` | `global-search`, `seo` | Search sudah global. Perlu pastikan route ini jadi pusat pencarian yang konsisten dari header/mobile. |
| AI Chat | `/ai-chat` | `AIChatClient`, product/article/video cards | `ai-chat-adapter`, `api`, `education-content` | Nilai tambah premium. Perlu dibatasi agar tidak menggeser flow utama non-premium. |
| FAQ/Kontak/static | `/faq`, `/kontak`, `/tentang-kami`, `/pengiriman-pembayaran`, `/garansi-retur`, `/kebijakan-privasi`, `/syarat-dan-ketentuan` | `StaticPageView`, `PathwaySection` | `static-page-metadata`, `hybrid-navigation` | Reusable dan rapi, tetapi tiap halaman terasa generik karena semua memakai pola CTA sama. |
| Migrasi situs | `/migrasi-situs` | Page utility custom | `seo` | Halaman operasional. Pastikan tidak masuk funnel utama. |

## Masalah UI/UX Utama

### P0 - Funnel transaksi dan trust

1. Product card terlalu padat untuk mobile.
   - `web/components/product-card.tsx` menampilkan media, wishlist, badge, rating, summary, price, dan tiga CTA penuh: `Tambah`, `Beli sekarang`, `Detail`.
   - Dampak: grid katalog cepat menjadi berat secara visual dan user pertanian mobile bisa ragu memilih aksi utama.
   - Rekomendasi: jadikan satu CTA utama per konteks, misalnya `Lihat detail` untuk discovery dan quick add compact untuk user yang sudah tahu produk.

2. Detail produk punya terlalu banyak CTA sederajat.
   - `web/components/product-detail-view.tsx` menampilkan `Tambah ke Keranjang`, `Beli Sekarang`, `Konsultasi via WhatsApp`, `B2B inquiry`, dan `Tanya AI`.
   - Dampak: keputusan beli tidak terasa punya urutan jelas.
   - Rekomendasi: buat hierarki mobile: beli/add sebagai primary, konsultasi sebagai secondary trust, B2B/AI sebagai expandable support.

3. Checkout terlalu kompleks dalam satu client component.
   - `web/components/checkout-form.tsx` sekitar 1177 baris dan menggabungkan auth redirect, sync cart, saved address, search ongkir, rate selection, minimum order, permission code, payment method, submit, dan result.
   - Dampak: risiko user gagal memahami langkah berikutnya dan risiko teknis tinggi saat redesign.
   - Rekomendasi: desain ulang sebagai step checkout: akun/cart, alamat/pickup, ongkir, pembayaran, review. Secara teknis pecah menjadi subkomponen setelah flow final disetujui.

4. Login sebagai gate checkout belum cukup ringkas.
   - `web/components/account-panel.tsx` dipakai untuk `/masuk`, `/login`, dan `/akun`.
   - Dampak: saat user checkout, halaman login membawa benefit/wishlist/Google/OTP sekaligus; user mungkin lupa bahwa tujuan utamanya menyelesaikan checkout.
   - Rekomendasi: tambahkan mode copy/action khusus `next=/checkout` saat redesign auth, tanpa mengubah kontrak auth.

5. Tracking order menampilkan waktu update yang berpotensi misleading.
   - `web/components/order-tracker.tsx` menampilkan `formatDate(new Date())` untuk "Pembaruan terakhir".
   - Dampak: trust bisa turun karena waktu tampak seperti status terbaru padahal bukan berasal dari payload order.
   - Rekomendasi: saat ada field timestamp API, pakai timestamp asli; jika tidak ada, ubah copy menjadi "Dicek pada".

### P1 - Information architecture dan discovery

1. Route edukasi dan commerce punya beberapa nama yang overlap.
   - Edukasi: `/artikel`, `/belajar`, `/edukasi` alias.
   - Commerce: `/produk`, `/belanja`, `/belanja/paket`, `/kampanye`, `/b2b`.
   - Dampak: SEO/discovery luas, tetapi nav mental model bisa kabur.
   - Rekomendasi: tentukan label canonical untuk nav utama. Misalnya header tetap `Produk`, tetapi `Belanja`, `Bundle`, `Campaign`, dan `B2B` menjadi subflow di dalam halaman produk/belanja.

2. Homepage mencoba menampilkan terlalu banyak entry point.
   - `web/app/page.tsx` menggabungkan masalah tanaman, tanaman, produk, artikel, video, AI, partner/trust, dan sticky CTA.
   - Dampak: bagus untuk brand story, namun first action perlu lebih tajam.
   - Rekomendasi: jadikan first viewport fokus pada tiga jalur: `Cari Solusi`, `Belanja Produk`, `Baca Edukasi`, dengan satu rekomendasi default paling kuat untuk pengguna baru.

3. Bridge edukasi ke transaksi belum selalu muncul cukup awal.
   - Listing/detail artikel punya relasi produk/solusi, tetapi user harus melewati beberapa blok konten.
   - Dampak: edukasi bisa berhenti sebagai konten, bukan memandu tindakan.
   - Rekomendasi: di artikel detail, hadirkan "langkah berikutnya" sticky/compact setelah ringkasan atau takeaways.

4. Mobile bottom nav item kelima berubah antara akun dan keranjang.
   - `web/components/mobile-bottom-nav.tsx` memakai slot terakhir untuk `Keranjang` bila cart berisi item, selain itu `Akun`.
   - Dampak: posisi aksi berubah secara semantik, dapat membingungkan user yang mencari akun/order.
   - Rekomendasi: tentukan satu identitas slot tetap, atau tampilkan cart badge di header/floating CTA saja.

5. Search tersebar di header, `/cari`, katalog produk, dan artikel.
   - Komponen sudah ada, tetapi pengalaman pencarian bisa terasa berbeda tergantung route.
   - Rekomendasi: jadikan `/cari` pusat hasil search lintas edukasi/produk/solusi/video, sementara search lokal menjadi filter route yang jelas.

### P2 - Konsistensi visual dan maintainability

1. CSS global terlalu besar dan saling override.
   - `globals.css` sekitar 9452 baris.
   - `design-system.css` sekitar 4665 baris.
   - Token root didefinisikan di dua tempat.
   - Dampak: redesign kecil bisa menghasilkan regressi halaman lain.
   - Rekomendasi: sebelum redesign besar, buat inventory selector dan pindahkan pola baru ke komponen/section class yang jelas. Jangan rewrite total sekali jalan.

2. Komponen lama dan baru bercampur.
   - Ada class lama seperti `hero-panel`, `product-detail`, `content-shell`, dan class baru seperti `homepage-hero`, `solution-experience-hero`, `product-showcase`.
   - Dampak: bahasa visual bisa tidak konsisten antar halaman.
   - Rekomendasi: pilih sistem section/card/button/filter/sticky CTA yang akan dipakai sebagai baseline redesign.

3. Beberapa komponen memakai inline style untuk layout penting.
   - Contoh: `product-card.tsx`, `product-detail-view.tsx`.
   - Dampak: sulit dikontrol via responsive CSS/theme.
   - Rekomendasi: pindahkan style layout yang stabil ke CSS setelah pola visual baru dipilih.

4. Static pages terlalu generik.
   - `StaticPageView` memberi PathwaySection dan CTA sama untuk semua halaman.
   - Dampak: FAQ/kontak/retur/pengiriman kurang terasa spesifik terhadap trust commerce.
   - Rekomendasi: buat variasi static page berdasarkan intent: bantuan, legal, brand, shipping/return.

## Rekomendasi File yang Perlu Diedit Saat Redesign

| Prioritas | File | Alasan |
| --- | --- | --- |
| P0 | `web/components/product-card.tsx` | Kurangi CTA density dan perjelas action per konteks katalog/rekomendasi/wishlist. |
| P0 | `web/components/product-detail-view.tsx` | Atur hierarki CTA beli, konsultasi, B2B, dan AI terutama mobile. |
| P0 | `web/components/checkout-form.tsx` | Pecah flow checkout menjadi langkah yang lebih mudah dipahami dan lebih aman dirawat. |
| P0 | `web/components/cart/cart-page-client.tsx` | Ringkas copy, kuatkan ringkasan biaya dan CTA login/checkout. |
| P0 | `web/components/account-panel.tsx` | Buat mode login khusus checkout dan mode akun pasca-login yang menonjolkan repeat order. |
| P0 | `web/components/order-tracker.tsx` | Perbaiki copy/timestamp trust dan jelasnya status pembayaran/fulfillment. |
| P1 | `web/components/app-header.tsx` | Rapikan label nav utama dan prioritas search/cart/account mobile. |
| P1 | `web/components/mobile-bottom-nav.tsx` | Stabilkan slot nav mobile agar akun/cart tidak saling menggantikan tanpa konteks. |
| P1 | `web/lib/hybrid-navigation.ts` | Tetapkan IA canonical untuk Solusi, Produk, Edukasi, AI, Tracking, dan turunan commerce. |
| P1 | `web/app/page.tsx` | Fokuskan first viewport dan entry point homepage. |
| P1 | `web/app/produk/page.tsx` | Sederhanakan filter dan urutan katalog berbasis masalah/tanaman. |
| P1 | `web/app/artikel/page.tsx` | Perjelas peran artikel sebagai jalur edukasi ke solusi/produk. |
| P1 | `web/app/artikel/[slug]/page.tsx` | Naikkan CTA solusi/produk setelah ringkasan artikel. |
| P1 | `web/app/solusi/page.tsx` | Jadikan wizard masalah tanaman sebagai action utama mobile. |
| P1 | `web/components/solution-result.tsx` | Pastikan hasil solusi memprioritaskan tindakan awal, produk relevan, lalu edukasi. |
| P1 | `web/components/search-result-tabs.tsx` dan `web/app/cari/page.tsx` | Konsolidasikan search lintas konten. |
| P2 | `web/app/globals.css` | Hindari perubahan massal; identifikasi selector legacy sebelum redesign. |
| P2 | `web/app/design-system.css` | Jadikan token dan pola baru lebih eksplisit, kurangi override ambigu. |
| P2 | `web/components/static-page-view.tsx` | Buat variasi layout/copy static page berdasarkan intent. |
| P2 | `web/components/ui/*` | Standarkan button, chip, section header, state, wizard, trust badge. |

## Risiko Teknis

1. Cascade CSS global tinggi.
   - Karena `globals.css` dan `design-system.css` sama-sama besar dan global, perubahan selector umum seperti `.btn`, `.page-intro`, `.section-heading`, `.product-card`, atau `.panel-card` bisa berdampak lintas halaman.

2. Checkout adalah area paling berisiko.
   - `CheckoutForm` mengandung banyak state dan efek async yang menyentuh customer cart, shipping, payment, saved address, permission code, dan redirect.
   - Redesign visual harus dipisahkan dari perubahan logic checkout kecuali sudah ada test/manual QA yang jelas.

3. Data live dan fallback bercampur.
   - Banyak page memakai `force-dynamic` dan fallback lokal saat API gagal.
   - UI state untuk "data live gagal" harus tetap terlihat baik di redesign.

4. Auth/cart/wishlist berada di app shell.
   - Perubahan header, bottom nav, cart badge, login gate, atau provider state bisa berdampak ke semua halaman.

5. Route alias bisa memengaruhi SEO dan canonical.
   - `/artikel`, `/belajar`, dan `/edukasi` serta `/produk` dan `/belanja` perlu keputusan canonical agar redesign tidak membuat duplicate intent.

6. Rich HTML artikel dan static page.
   - `ArticleDetailPage` dan `StaticPageView` memakai `dangerouslySetInnerHTML`.
   - Redesign CSS `.rich-content` perlu hati-hati agar konten HTML dari backend tetap aman dan readable.

7. External dependencies di UX kritis.
   - Checkout bergantung pada Google Places, shipping rates, Duitku, dan minimum order/permission code.
   - Desain loading/error/retry harus dianggap bagian utama flow, bukan state sampingan.

8. Banyak CTA menuju WhatsApp/AI/B2B.
   - Tracking commerce intent dan lead source ada di `growth-commerce` dan `commerce-tracking`.
   - Saat menyederhanakan CTA, jangan hilangkan konteks tracking yang dipakai tim ops.

## Urutan Redesign yang Disarankan

1. P0 commerce mobile: `ProductCard`, product detail CTA, cart summary, checkout stepper.
2. P1 IA/nav: header, mobile bottom nav, canonical labels untuk Produk/Edukasi/Solusi.
3. P1 education-to-commerce: artikel listing/detail, solusi result, search.
4. P2 design system hardening: token, shared UI component, static pages, CSS cleanup bertahap.

## Catatan Validasi Audit

- Audit ini hanya menambah dokumen `web/docs/ui-ux-audit.md`.
- Tidak ada production component, page, lib, atau CSS yang diubah dalam task ini.
- Validasi yang diminta: jalankan `cd web && npm run typecheck`.
