# Blueprint Solusi Kios Sidomakmur

## Ringkasan keputusan

Kios Sidomakmur dibangun sebagai platform storefront customer-facing yang:

- menampilkan katalog pertanian dari data pusat
- menerima order web dan Android
- menyimpan cache agar katalog tetap tampil saat koneksi buruk
- mengirim transaksi kembali ke SiGe Manajer sebagai source of truth final
- siap diperluas ke multi cabang dan multi brand tanpa refactor arsitektur inti

Saya sengaja memilih pendekatan `backend storefront modular monolith + web Next.js + Android native Compose`, karena ini paling seimbang untuk performa, stabilitas, dan maintainability di fase awal.

## Tahap 1 - Analisis kebutuhan

### 1.1 Ringkasan kebutuhan bisnis Kios Sidomakmur

Kios Sidomakmur adalah kanal penjualan online resmi Sidomakmur untuk produk:

- alat pertanian
- herbisida
- benih
- nutrisi

Peran bisnis aplikasi ini bukan sebagai pusat master data, tetapi sebagai channel commerce yang:

- menarik data master dari SiGe Manajer
- menayangkan katalog yang konsisten per toko/cabang
- menerima transaksi customer
- meneruskan transaksi, pembayaran, dan status pengiriman ke SiGe Manajer
- tetap bisa melayani tampilan katalog saat internet terputus melalui cache
- tetap bisa menahan transaksi sementara sebelum sinkron ulang

Implikasi teknis terpenting:

- semua data master kritis harus punya `source_version` dari SiGe Manajer
- semua transaksi outbound dari Kios harus punya `idempotency_key`
- status order final tidak boleh ditentukan sepihak oleh Kios
- harga dan stok yang tampil di Kios harus bisa dibedakan per store/cabang

### 1.2 Aktor / user

#### Customer guest

- melihat katalog
- mencari dan memfilter produk
- checkout tanpa login
- melacak order dengan nomor order dan nomor HP

#### Customer terdaftar

- login dengan Google
- login dengan WhatsApp OTP
- menyimpan wishlist
- menyimpan banyak alamat
- melihat riwayat pesanan

#### Admin toko online / operator store

- melihat order channel Kios
- mengelola banner, artikel, konten, dan halaman statis
- mengubah promo tertentu jika pusat mengizinkan
- memantau status sinkronisasi

#### SiGe Manajer

- mengirim master data ke Kios
- menerima transaksi dari Kios
- menetapkan status order final
- mengontrol aturan operasional, payment method, promo utama, dan konten pusat

### 1.3 Fitur wajib

#### Katalog dan konten

- kategori dan subkategori
- pencarian produk
- filter kategori
- sorting
- multi foto
- video produk
- produk unggulan
- produk terbaru
- produk terlaris
- harga grosir
- harga member / reseller
- harga berbeda per cabang / store
- banner homepage
- halaman statis
- artikel / blog
- SEO teknis dan metadata

#### Customer dan checkout

- guest checkout
- login Google
- login WhatsApp OTP
- wishlist
- banyak alamat
- cart persisten
- riwayat order
- tracking order

#### Order dan pembayaran

- payment gateway Duitku
- callback verifikasi otomatis
- auto-cancel order belum dibayar dalam 24 jam
- invoice putih
- invoice merah
- label pengiriman
- status order mengikuti pusat

#### Integrasi

- sync master data dari SiGe Manajer
- push order / customer / payment / shipment status ke pusat
- cache offline untuk katalog
- retry sinkronisasi saat koneksi pulih

### 1.4 Fitur tahap berikutnya

- ongkir otomatis lintas kurir seluruh Indonesia
- loyalty / membership benefit lebih kaya
- voucher dan kupon
- rekomendasi produk personalisasi
- multi warehouse fulfillment lebih kompleks
- push notification Android
- analitik marketing dan conversion funnel
- integrasi marketplace pihak ketiga

### 1.5 Asumsi

- SiGe Manajer menyediakan API pusat yang stabil untuk master data dan penerimaan transaksi
- setiap branch/store punya identitas unik yang konsisten di pusat
- domain `sidomakmur.com` dapat meng-host web storefront dan subdomain API
- payment gateway yang digunakan pada fase awal adalah Duitku
- volume awal masih cukup aman untuk modular monolith tunggal

### 1.6 Risiko

- tanpa reserved stock di pusat, risiko overselling tinggi
- jika Kios menyimpan harga tanpa versioning, harga stale akan sulit dilacak
- jika callback payment tidak diverifikasi signature-nya, risiko payment spoofing tinggi
- jika offline queue tidak idempotent, order duplikat akan terjadi
- jika desain tenant brand/store tidak disiapkan sejak awal, ekspansi ke brand lain mahal

## Tahap 2 - Desain produk

### 2.1 Arsitektur Kios Sidomakmur

Saya merekomendasikan arsitektur berikut:

```text
SiGe Manajer
   |  publish master data + terima transaksi
   v
Kios Sync Adapter / Integration Layer
   |  normalisasi, versioning, idempotency
   v
Kios Backend Storefront (FastAPI modular monolith)
   |-- Catalog module
   |-- Pricing module
   |-- Promotion module
   |-- Cart & Checkout module
   |-- Payment module
   |-- Content & SEO module
   |-- Customer module
   |-- Sync module
   |
   |--> PostgreSQL
   |--> Redis
   |--> Queue worker
   |--> Object storage
   |
   +--> Web storefront (Next.js)
   +--> Android app (Kotlin + Compose)
```

### 2.2 Hubungan dengan SiGe Manajer

#### Prinsip integrasi

- SiGe Manajer tetap source of truth utama
- Kios hanya menyimpan salinan operasional dan transaksi channel
- status akhir order, payment settlement, dan shipment final tetap divalidasi pusat

#### Alur data masuk ke Kios

`SiGe Manajer -> outbox event / delta feed -> Kios sync worker -> staging -> publish ke read model`

Data masuk:

- produk
- kategori
- harga
- stok publishable
- promo
- banner
- metode pembayaran
- pengaturan operasional
- active flag produk
- halaman statis
- konten artikel

#### Alur data keluar dari Kios

`Web/Android -> Kios backend -> local outbox -> SiGe integration API -> ack -> sync log`

Data keluar:

- customer
- order
- payment
- shipment status
- retur request bila ada proses lanjutan

### 2.3 Strategi sinkronisasi

Saya memilih strategi `delta sync + versioning + idempotency`, bukan full overwrite per request.

#### Inbound master data dari pusat

- setiap entitas master memiliki `source_id`, `source_version`, `source_updated_at`
- Kios menyimpan `last_synced_version` per entitas per store
- sync dilakukan dengan delta feed berdasarkan `since_version` atau `since_updated_at`
- data masuk ke staging, lalu di-publish ke tabel aktif dalam satu transaksi

#### Outbound transaksi ke pusat

- setiap payload transaksi punya `idempotency_key`
- transaksi lokal masuk `sync_logs` dengan status `pending`
- worker melakukan retry eksponensial
- jika pusat sudah pernah menerima `idempotency_key` yang sama, Kios menganggap sukses idempotent

#### Conflict handling

- untuk master data: `center wins`
- untuk order status: `center wins`
- untuk cart lokal: `client wins` sampai checkout
- untuk payment callback: `gateway verified event wins`, lalu pusat mengonfirmasi status final

### 2.4 Strategi cache / offline

#### Web

- gunakan service worker untuk precache shell dan runtime cache untuk katalog
- cache data katalog tersimpan di IndexedDB
- homepage, katalog, detail produk, banner, dan halaman statis bisa dibuka dari cache terakhir
- checkout tetap mengizinkan submit draft jika koneksi terputus pada langkah akhir, lalu status ditandai `pending_sync`

#### Android

- Room untuk local cache dan offline queue
- WorkManager untuk retry sinkronisasi background
- gambar memakai cache disk bawaan image loader

#### Backend

- PostgreSQL menyimpan read model utama
- Redis dipakai untuk short-lived cache, rate limit, OTP session, dan job coordination
- object storage menyimpan media produk, banner, dan invoice PDF

#### Aturan offline

- katalog dan konten tetap bisa tampil
- cart lokal tetap bisa dibaca
- checkout offline boleh membuat `submission draft` jika payment belum diarahkan ke gateway
- payment online tidak boleh dianggap sukses tanpa callback gateway

### 2.5 Strategi keamanan

- customer auth: Google OIDC dan WhatsApp OTP
- admin/operator auth: terpisah, tidak bercampur dengan customer auth
- JWT access token pendek, refresh token rotasi
- hash password `argon2` untuk akun internal bila ada
- semua callback payment wajib verifikasi signature dan amount
- rate limiting untuk login, OTP, dan checkout
- audit trail untuk semua event sinkronisasi dan perubahan konten
- secret gateway dan token integrasi disimpan di env / secret manager
- row scoping menggunakan `brand_id` dan `store_id`

### 2.6 Alasan keputusan teknis

- modular monolith dipilih agar transaksi katalog, promo, cart, checkout, payment, dan sync tetap konsisten
- memisahkan Kios dari SiGe mencegah coupling UI customer dengan sistem operasional internal
- delta sync lebih hemat daripada full refresh dan lebih aman untuk multi store
- cache offline di web dan Android menutup kebutuhan katalog tetap tampil saat internet putus

## Tahap 3 - Desain domain dan database

### 3.1 ERD tekstual

```text
brands 1---* stores
stores 1---* categories
categories 1---* categories (self parent)
categories 1---* products
products 1---* product_images
products 1---* product_videos
products 1---* product_prices
products *---* promotions (via rule payload / mapping)
customers 1---* customer_addresses
customers 1---* carts
carts 1---* cart_items
customers 1---* orders
orders 1---* order_items
orders 1---* payments
orders 1---* shipments
orders 1---* invoices
stores 1---* banners
stores 1---* content_pages
stores 1---* app_settings
sync_logs merekam inbound dan outbound untuk semua entitas penting
```

### 3.2 Catatan desain data

- semua tabel operasional utama menyimpan `brand_id` dan `store_id` bila relevan
- semua tabel master hasil sinkronisasi menyimpan `source_id` dan `source_version`
- semua tabel transaksi outbound menyimpan `idempotency_key`
- semua tabel penting punya `created_at` dan `updated_at`

### 3.3 Struktur tabel utama

#### `customers`

- Kolom utama: `id`, `brand_id`, `store_id`, `customer_code`, `full_name`, `phone`, `email`, `google_sub`, `auth_provider`, `whatsapp_verified_at`, `is_guest`, `member_tier`, `last_order_at`, `source_customer_id`, `source_version`, `created_at`, `updated_at`
- Relasi: satu customer punya banyak `customer_addresses`, `orders`, `carts`
- Index penting: `(brand_id, phone)`, `(brand_id, email)`, `(brand_id, google_sub)`, `(store_id, last_order_at desc)`
- Validasi utama: email lowercase, phone ternormalisasi, `google_sub` unik bila terisi, guest boleh tanpa email

#### `customer_addresses`

- Kolom utama: `id`, `customer_id`, `label`, `recipient_name`, `recipient_phone`, `address_line`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `notes`, `is_default`, `created_at`, `updated_at`
- Relasi: banyak address milik satu customer
- Index penting: `(customer_id, is_default)`, `(province, city)`
- Validasi utama: hanya satu default per customer, postal code 5 digit jika diisi

#### `categories`

- Kolom utama: `id`, `brand_id`, `store_id`, `parent_id`, `source_id`, `source_version`, `name`, `slug`, `description`, `sort_order`, `is_active`, `seo_title`, `seo_description`, `created_at`, `updated_at`
- Relasi: self parent-child, satu category punya banyak products
- Index penting: `(store_id, slug)`, `(store_id, parent_id, sort_order)`, `(store_id, is_active)`
- Validasi utama: slug unik per store, parent tidak boleh loop

#### `products`

- Kolom utama: `id`, `brand_id`, `store_id`, `category_id`, `source_id`, `source_version`, `sku`, `slug`, `name`, `summary`, `description`, `product_type`, `unit`, `weight_grams`, `min_qty`, `is_active`, `is_featured`, `is_new_arrival`, `is_best_seller`, `seo_title`, `seo_description`, `seo_keywords`, `created_at`, `updated_at`
- Relasi: satu product punya banyak `product_images`, `product_videos`, `product_prices`; product muncul di `cart_items` dan `order_items`
- Index penting: `(store_id, sku)`, `(store_id, slug)`, `(store_id, category_id, is_active)`, full-text index `name`, `summary`, `description`
- Validasi utama: SKU unik per store, `weight_grams >= 0`, `product_type` harus valid

#### `product_images`

- Kolom utama: `id`, `product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`
- Relasi: banyak image ke satu product
- Index penting: `(product_id, sort_order)`, partial unique primary image
- Validasi utama: satu primary image per product

#### `product_videos`

- Kolom utama: `id`, `product_id`, `video_url`, `platform`, `thumbnail_url`, `sort_order`, `created_at`
- Relasi: banyak video ke satu product
- Index penting: `(product_id, sort_order)`
- Validasi utama: URL valid, platform `youtube|mp4|other`

#### `product_prices`

- Kolom utama: `id`, `product_id`, `brand_id`, `store_id`, `source_id`, `source_version`, `price_type`, `member_level`, `min_qty`, `currency_code`, `amount`, `compare_at_amount`, `starts_at`, `ends_at`, `is_active`, `created_at`, `updated_at`
- Relasi: banyak price ke satu product
- Index penting: `(store_id, product_id, price_type, member_level, min_qty)`, `(store_id, is_active, starts_at, ends_at)`
- Validasi utama: `amount >= 0`, hanya satu harga aktif untuk kombinasi waktu yang overlap, `min_qty >= 1`

#### `promotions`

- Kolom utama: `id`, `brand_id`, `store_id`, `source_id`, `source_version`, `promotion_code`, `name`, `description`, `promotion_type`, `rule_payload`, `allow_store_override`, `created_by_center`, `priority`, `starts_at`, `ends_at`, `status`, `created_at`, `updated_at`
- Relasi: dipakai saat perhitungan cart dan order
- Index penting: `(store_id, status, starts_at, ends_at)`, `(store_id, promotion_code)`
- Validasi utama: `BUY_X_GET_Y` wajib punya payload lengkap, `starts_at < ends_at`

#### `carts`

- Kolom utama: `id`, `brand_id`, `store_id`, `customer_id`, `guest_token`, `channel`, `status`, `currency_code`, `subtotal`, `discount_total`, `grand_total`, `expires_at`, `last_synced_at`, `created_at`, `updated_at`
- Relasi: satu cart punya banyak `cart_items`, opsional terkait customer
- Index penting: `(guest_token)`, `(customer_id, status)`, `(store_id, updated_at desc)`
- Validasi utama: satu cart aktif per customer atau guest token per store

#### `cart_items`

- Kolom utama: `id`, `cart_id`, `product_id`, `qty`, `price_snapshot`, `discount_snapshot`, `promotion_snapshot`, `subtotal`, `total`, `created_at`, `updated_at`
- Relasi: banyak item ke satu cart
- Index penting: `(cart_id, product_id)`
- Validasi utama: qty > 0, item unik per produk dalam satu cart

#### `orders`

- Kolom utama: `id`, `brand_id`, `store_id`, `customer_id`, `cart_id`, `order_number`, `external_order_number`, `channel`, `checkout_type`, `status`, `payment_status`, `fulfillment_status`, `customer_snapshot`, `address_snapshot`, `pricing_snapshot`, `notes`, `subtotal`, `discount_total`, `shipping_total`, `grand_total`, `payment_due_at`, `auto_cancel_at`, `source_id`, `source_version`, `sync_status`, `idempotency_key`, `created_at`, `updated_at`
- Relasi: satu order punya banyak `order_items`, `payments`, `shipments`, `invoices`
- Index penting: `(store_id, order_number)`, `(customer_id, created_at desc)`, `(status, payment_status)`, `(sync_status, created_at)`, `(idempotency_key)`
- Validasi utama: order number unik, `grand_total >= 0`, unpaid order wajib punya `auto_cancel_at`

#### `order_items`

- Kolom utama: `id`, `order_id`, `product_id`, `product_snapshot`, `qty`, `unit_price`, `discount_total`, `line_total`, `created_at`
- Relasi: banyak item ke satu order
- Index penting: `(order_id, product_id)`
- Validasi utama: qty > 0, `line_total >= 0`

#### `payments`

- Kolom utama: `id`, `order_id`, `payment_reference`, `gateway_code`, `gateway_transaction_id`, `gateway_session_id`, `method_code`, `amount`, `status`, `paid_at`, `callback_payload`, `callback_signature`, `settlement_payload`, `idempotency_key`, `created_at`, `updated_at`
- Relasi: banyak payment ke satu order
- Index penting: `(order_id, status)`, `(gateway_transaction_id)`, `(payment_reference)`, `(idempotency_key)`
- Validasi utama: amount > 0, callback hanya boleh memajukan state yang valid

#### `shipments`

- Kolom utama: `id`, `order_id`, `shipment_number`, `delivery_method`, `courier_name`, `tracking_number`, `pickup_store_code`, `status`, `shipped_at`, `delivered_at`, `tracking_payload`, `created_at`, `updated_at`
- Relasi: banyak shipment ke satu order
- Index penting: `(order_id, status)`, `(tracking_number)`, `(shipment_number)`
- Validasi utama: tracking boleh kosong untuk pickup, state machine valid

#### `invoices`

- Kolom utama: `id`, `order_id`, `invoice_number`, `invoice_type`, `document_url`, `printed_at`, `created_at`
- Relasi: banyak invoice ke satu order
- Index penting: `(order_id, invoice_type)`, `(invoice_number)`
- Validasi utama: `invoice_type` hanya `PUTIH` atau `MERAH`, nomor unik

#### `banners`

- Kolom utama: `id`, `brand_id`, `store_id`, `source_id`, `source_version`, `title`, `subtitle`, `image_url`, `mobile_image_url`, `target_url`, `sort_order`, `starts_at`, `ends_at`, `is_active`, `created_at`, `updated_at`
- Relasi: banner milik store
- Index penting: `(store_id, is_active, sort_order)`
- Validasi utama: banner tanpa image tetap boleh pada fase awal, tapi modul tetap tersedia

#### `content_pages`

- Kolom utama: `id`, `brand_id`, `store_id`, `source_id`, `source_version`, `page_type`, `slug`, `title`, `excerpt`, `body_html`, `cover_image_url`, `is_published`, `published_at`, `seo_title`, `seo_description`, `seo_keywords`, `created_at`, `updated_at`
- Relasi: halaman statis dan artikel/blog memakai tabel yang sama lewat `page_type`
- Index penting: `(store_id, page_type, slug)`, `(store_id, page_type, is_published, published_at desc)`
- Validasi utama: slug unik per store dan type, `body_html` harus disanitasi

#### `app_settings`

- Kolom utama: `id`, `brand_id`, `store_id`, `setting_group`, `setting_key`, `setting_value`, `source_id`, `source_version`, `is_public`, `created_at`, `updated_at`
- Relasi: key-value config storefront
- Index penting: `(store_id, setting_group, setting_key)`, `(store_id, is_public)`
- Validasi utama: kombinasi group + key unik per store

#### `sync_logs`

- Kolom utama: `id`, `direction`, `entity_type`, `entity_id`, `store_id`, `source_version`, `idempotency_key`, `status`, `attempt_count`, `last_error`, `payload_hash`, `payload_json`, `processed_at`, `created_at`, `updated_at`
- Relasi: referensi longgar ke entitas inbound maupun outbound
- Index penting: `(direction, status, created_at)`, `(entity_type, entity_id)`, `(idempotency_key)`
- Validasi utama: `idempotency_key` unik untuk outbound transaksi, payload hash diisi untuk dedupe

## Tahap 4 - Desain API

Semua endpoint versi awal memakai prefix `/api/v1`.

### 4.1 Public storefront API

#### `GET /storefront/home`

- Auth: none
- Request: `store_code`, optional `device=web|mobile`
- Response: `banners`, `featured_products`, `new_arrivals`, `best_sellers`, `category_highlights`, `seo`
- Validasi: store wajib valid
- Aturan bisnis: hanya data aktif hasil publish terakhir

#### `GET /storefront/categories`

- Auth: none
- Query: `store_code`
- Response: kategori tree
- Validasi: hanya kategori aktif
- Aturan bisnis: urut `sort_order`

#### `GET /storefront/products`

- Auth: none
- Query: `store_code`, `q`, `category_slug`, `sort`, `page`, `page_size`, `member_level`
- Response: `items`, `pagination`, `available_filters`, `seo`
- Validasi: `page_size` dibatasi, `sort` dari enum
- Aturan bisnis: harga mengikuti store dan member level

#### `GET /storefront/products/{slug}`

- Auth: none
- Query: `store_code`, optional `member_level`
- Response: detail produk, images, videos, prices, promotions, related products, stock badge, seo
- Validasi: slug aktif wajib ada
- Aturan bisnis: stok publik hanya bentuk aman, bukan stok gudang detail

#### `GET /storefront/banners`

- Auth: none
- Query: `store_code`, `placement`
- Response: daftar banner aktif
- Validasi: waktu aktif valid

#### `GET /storefront/pages/{slug}`

- Auth: none
- Query: `store_code`
- Response: halaman statis
- Aturan bisnis: dipakai untuk Tentang Kami, Kontak, Kebijakan Privasi, S&K, FAQ

#### `GET /storefront/articles`

- Auth: none
- Query: `store_code`, `page`, `page_size`, optional `q`
- Response: daftar artikel/blog

#### `GET /storefront/articles/{slug}`

- Auth: none
- Query: `store_code`
- Response: detail artikel + seo

#### `GET /storefront/seo`

- Auth: none
- Query: `store_code`, `path`
- Response: `title`, `description`, `keywords`, `canonical_url`, `open_graph`, `json_ld`
- Aturan bisnis: fallback ke metadata default jika halaman tidak punya metadata khusus

### 4.2 Customer API

#### `POST /customer/auth/google`

- Auth: none
- Request: `id_token`, `store_code`
- Response: `access_token`, `refresh_token`, `customer`
- Validasi: token Google OIDC valid, email verified
- Aturan bisnis: customer di-upsert bila belum ada

#### `POST /customer/auth/whatsapp/request-otp`

- Auth: none
- Request: `phone`, `store_code`
- Response: `challenge_id`, `expires_in_seconds`
- Validasi: rate-limited, phone valid
- Aturan bisnis: OTP tidak pernah dikembalikan ke client

#### `POST /customer/auth/whatsapp/verify-otp`

- Auth: none
- Request: `challenge_id`, `otp_code`
- Response: `access_token`, `refresh_token`, `customer`
- Validasi: challenge belum expired, OTP cocok
- Aturan bisnis: customer di-upsert berdasarkan nomor WhatsApp

#### `POST /customer/carts/guest`

- Auth: none
- Request: `store_code`
- Response: `cart_id`, `guest_token`

#### `GET /customer/carts/current`

- Auth: bearer customer atau `guest_token`
- Query: `store_code`
- Response: detail cart, items, total, applied promotions

#### `POST /customer/carts/items`

- Auth: bearer customer atau `guest_token`
- Request: `cart_id`, `product_id`, `qty`
- Response: cart terbaru
- Validasi: qty > 0, produk aktif
- Aturan bisnis: harga dan promo dihitung ulang server-side

#### `PATCH /customer/carts/items/{item_id}`

- Auth: bearer customer atau `guest_token`
- Request: `qty`
- Aturan bisnis: qty 0 berarti hapus item

#### `POST /customer/checkout/guest`

- Auth: `guest_token`
- Request: `cart_id`, `customer`, `shipping_method`, `pickup_store_code`, `address`, `payment_method`, `notes`
- Response: `order`, `payment_instruction`, `next_action`
- Validasi: cart tidak kosong, alamat wajib untuk delivery, payment method aktif
- Aturan bisnis: customer guest dibuat otomatis, order `pending_payment`, `auto_cancel_at = +24 jam`

#### `POST /customer/checkout/authenticated`

- Auth: bearer customer
- Request: `cart_id`, `address_id`, `pickup_store_code`, `shipping_method`, `payment_method`, `notes`
- Response: sama seperti guest checkout

#### `GET /customer/orders`

- Auth: bearer customer
- Query: `page`, `page_size`, `status`
- Response: riwayat order

#### `GET /customer/orders/{order_number}`

- Auth: bearer customer atau public tracking token
- Response: detail order, items, payment status, shipment status, invoice list

#### `GET /customer/orders/track`

- Auth: none
- Query: `order_number`, `phone`
- Response: order tracking summary
- Validasi: nomor HP harus cocok dengan snapshot order

#### `GET /customer/orders/{order_number}/invoice/putih`

- Auth: bearer customer atau tracking token
- Response: `document_url`, `invoice_number`

#### `GET /customer/orders/{order_number}/invoice/merah`

- Auth: bearer customer atau tracking token
- Response: `document_url`, `invoice_number`
- Aturan bisnis: hanya tersedia jika order method mengharuskan nota merah

### 4.3 Android app API

#### `POST /android/device/register`

- Auth: bearer customer
- Request: `device_id`, `device_name`, `app_version`, `platform_version`
- Response: `device_token`

#### `GET /android/bootstrap`

- Auth: bearer customer atau guest token
- Query: `store_code`, `since_cursor`
- Response: `catalog_delta`, `banners`, `content_delta`, `settings`, `cursor`
- Aturan bisnis: dipakai untuk warm cache Android

#### `POST /android/cache-sync`

- Auth: bearer customer atau guest token
- Request: `store_code`, `known_versions`
- Response: entitas yang berubah sejak versi terakhir

### 4.4 Admin / store operator API

#### `GET /admin/orders`

- Auth: bearer operator
- Query: `store_code`, `status`, `payment_status`, `date_from`, `date_to`
- Response: daftar order channel Kios

#### `GET /admin/promotions`

- Auth: bearer operator
- Response: daftar promo

#### `PATCH /admin/promotions/{id}`

- Auth: bearer operator dengan permission promo override
- Request: field yang diizinkan pusat
- Validasi: hanya promo `allow_store_override = true`

#### `GET /admin/banners`

- Auth: bearer operator

#### `POST /admin/banners`

- Auth: bearer operator
- Request: `title`, `image_url`, `target_url`, `starts_at`, `ends_at`
- Aturan bisnis: banner store tidak boleh menimpa banner pusat yang locked

#### `GET /admin/content-pages`

- Auth: bearer operator

#### `POST /admin/content-pages`

- Auth: bearer operator
- Request: `page_type`, `slug`, `title`, `body_html`, `seo_*`
- Validasi: sanitasi HTML

#### `GET /admin/sync-logs`

- Auth: bearer operator
- Query: `direction`, `status`, `entity_type`
- Response: daftar sync logs

### 4.5 Sync API dengan SiGe Manajer

#### `GET /sync/master-data`

- Auth: HMAC / integration token
- Query: `store_code`, `since_version`, `entity_types`
- Response: `categories`, `products`, `product_prices`, `promotions`, `banners`, `content_pages`, `app_settings`, `cursor`
- Validasi: token dan store scope wajib valid
- Aturan bisnis: implementasi awal saya sarankan Kios mem-pull delta dari pusat

#### `POST /sync/orders`

- Auth: integration token
- Request: order payload Kios ke pusat
- Response: `accepted`, `center_order_id`, `center_status`
- Validasi: `idempotency_key`, product snapshot, grand total
- Aturan bisnis: pusat melakukan dedupe berdasarkan `idempotency_key`

#### `POST /sync/customers`

- Auth: integration token
- Request: customer payload
- Aturan bisnis: upsert berdasar external customer id atau phone/email

#### `POST /sync/payments`

- Auth: integration token
- Request: payment payload
- Aturan bisnis: pusat memverifikasi kecocokan amount dan order state

#### `POST /sync/shipments/status`

- Auth: integration token
- Request: `order_number`, `status`, `tracking_number`
- Aturan bisnis: state machine wajib valid

#### `GET /sync/cache-manifest`

- Auth: integration token
- Query: `store_code`, `since_version`
- Response: entitas yang perlu dicache, hash/etag, cursor

### 4.6 Payment Duitku

#### `POST /customer/payments/duitku/create`

- Auth: bearer customer atau guest token
- Request: `order_id`, `return_url`, `callback_url`
- Response: `reference`, `payment_url`, `expiry`
- Validasi: order masih `pending_payment`, amount cocok
- Aturan bisnis: request ke Duitku dilakukan server-to-server

#### `POST /payments/duitku/callback`

- Auth: none, diverifikasi signature
- Request: payload callback dari Duitku
- Response: `200 OK`
- Validasi: signature valid, merchant code cocok, amount cocok, order reference valid
- Aturan bisnis: jika valid, payment masuk `paid` lalu dipush ke SiGe

### 4.7 Cache sync contract

```json
{
  "cursor": "2026-03-19T10:00:00Z:15392",
  "etag": "sha256:....",
  "categories": [],
  "products": [],
  "prices": [],
  "banners": [],
  "content_pages": [],
  "settings": [],
  "deleted_ids": {
    "products": [],
    "categories": []
  }
}
```

## Tahap 5 - Desain UI/UX

### 5.1 Struktur menu web desktop

- Beranda
- Kategori
- Produk
- Promo
- Artikel
- Tentang Kami
- Kontak
- FAQ
- Wishlist
- Riwayat Pesanan
- Keranjang
- Akun

Header desktop:

- logo kiri
- search bar besar tengah
- shortcut kategori
- ikon wishlist
- ikon akun
- ikon cart

### 5.2 Struktur menu web mobile

- Beranda
- Kategori
- Promo
- Artikel
- Cart

Bottom nav mobile:

- Beranda
- Kategori
- Wishlist
- Pesanan
- Akun

### 5.3 Struktur menu aplikasi Android

- Beranda
- Kategori
- Wishlist
- Pesanan
- Akun

Drawer / menu tambahan:

- Tentang Kami
- Kontak
- Kebijakan Privasi
- Syarat dan Ketentuan
- FAQ
- Artikel
- Pengaturan cache

### 5.4 Wireframe teks homepage

```text
+------------------------------------------------------------------------------------------------+
| Logo Sidomakmur | Cari produk, herbisida, benih, nutrisi... | Akun | Wishlist | Cart (2)      |
+------------------------------------------------------------------------------------------------+
| Tab kategori cepat: Alat Pertanian | Herbisida | Benih | Nutrisi                               |
+------------------------------------------------------------------------------------------------+
| HERO BANNER                                                                              [<>] |
| Promo musiman / banner pusat / banner store                                                  |
+------------------------------------------------------------------------------------------------+
| Keunggulan                                                                                   |
| [Harga toko] [Produk terkurasi] [Ambil di toko] [Siap kirim Jatim]                           |
+------------------------------------------------------------------------------------------------+
| Produk Unggulan                                                                               |
| [Card] [Card] [Card] [Card]                                                                   |
+------------------------------------------------------------------------------------------------+
| Produk Terbaru                                                                                |
| [Card] [Card] [Card] [Card]                                                                   |
+------------------------------------------------------------------------------------------------+
| Produk Terlaris                                                                               |
| [Card] [Card] [Card] [Card]                                                                   |
+------------------------------------------------------------------------------------------------+
| Artikel Pertanian                                                                             |
| [Artikel 1] [Artikel 2] [Artikel 3]                                                           |
+------------------------------------------------------------------------------------------------+
| Footer: Tentang Kami | Kontak | Privasi | S&K | FAQ | Blog                                    |
+------------------------------------------------------------------------------------------------+
```

### 5.5 Wireframe katalog

```text
+-----------------------------------------------------------------------------------------------+
| Breadcrumb: Beranda / Kategori / Benih                                                        |
| Sidebar Filter                 | Grid Produk                                                   |
| - Kategori                     | Sort: Terbaru v                                               |
| - Tipe harga                   | ------------------------------------------------------------ |
| - Rentang harga                | [Card produk] [Card produk] [Card produk]                    |
| - Tersedia promo               | [Card produk] [Card produk] [Card produk]                    |
|                                | Pagination                                                    |
+-----------------------------------------------------------------------------------------------+
```

### 5.6 Wireframe detail produk

```text
+-----------------------------------------------------------------------------------------------+
| Gallery vertikal | Foto utama / video                                                         |
|-----------------------------------------------------------------------------------------------|
| Nama produk                                                                                   |
| Badge: Unggulan | Terlaris | Promo                                                            |
| Harga retail                                                                                    |
| Harga grosir mulai qty tertentu                                                                 |
| Harga member/reseller jika login                                                                |
| Ringkasan                                                                                      |
| Qty [-] [1] [+]                                                                                |
| [Tambah ke Keranjang] [Beli Sekarang]                                                          |
|-----------------------------------------------------------------------------------------------|
| Tabs: Deskripsi | Video | Promo | Produk Terkait                                              |
+-----------------------------------------------------------------------------------------------+
```

### 5.7 Wireframe cart

```text
+-----------------------------------------------------------------------------------------------+
| Keranjang                                                                                     |
|-----------------------------------------------------------------------------------------------|
| [Img] Produk A  Qty [-][2][+]  Harga x Qty  [Hapus]                                          |
| Promo: Beli 2 gratis 1 pupuk sample                                                           |
|-----------------------------------------------------------------------------------------------|
| Catatan order                                                                                 |
| Estimasi: Pickup / Kirim mandiri                                                               |
|-----------------------------------------------------------------------------------------------|
| Subtotal                                                                                      |
| Diskon                                                                                        |
| Total                                                                                         |
| [Lanjut Checkout]                                                                             |
+-----------------------------------------------------------------------------------------------+
```

### 5.8 Wireframe checkout

```text
+-----------------------------------------------------------------------------------------------+
| Checkout                                                                                      |
| Step 1 Data customer | Step 2 Pengiriman | Step 3 Pembayaran                                  |
|-----------------------------------------------------------------------------------------------|
| Data customer                                                                                |
| Nama                                                                                          |
| No. WhatsApp                                                                                  |
| Email                                                                                         |
|-----------------------------------------------------------------------------------------------|
| Metode pengiriman                                                                             |
| ( ) Ambil di toko                                                                             |
| ( ) Pengiriman mandiri                                                                        |
|-----------------------------------------------------------------------------------------------|
| Metode pembayaran                                                                             |
| [Duitku - VA] [Duitku - QRIS] [COD jika diaktifkan]                                           |
|-----------------------------------------------------------------------------------------------|
| Ringkasan order                                                                               |
| [Place Order]                                                                                 |
+-----------------------------------------------------------------------------------------------+
```

### 5.9 Wireframe riwayat pesanan

```text
+-----------------------------------------------------------------------------------------------+
| Pesanan Saya                                                                                  |
| Filter: Semua | Menunggu Pembayaran | Diproses | Dikirim | Selesai                            |
|-----------------------------------------------------------------------------------------------|
| SO-20260319-001                                                                               |
| Status: Menunggu pembayaran                                                                   |
| Total: Rp 250.000                                                                             |
| [Bayar sekarang] [Lacak] [Invoice]                                                            |
|-----------------------------------------------------------------------------------------------|
| SO-20260318-014                                                                               |
| Status: Dikirim                                                                               |
| Resi: SDM-001                                                                                 |
| [Lacak] [Invoice]                                                                             |
+-----------------------------------------------------------------------------------------------+
```

### 5.10 Wireframe halaman artikel

```text
+-----------------------------------------------------------------------------------------------+
| Hero artikel / kategori artikel                                                               |
|-----------------------------------------------------------------------------------------------|
| Search artikel                                                                                |
| [Card artikel besar]                                                                          |
| [Card artikel] [Card artikel] [Card artikel]                                                  |
| Sidebar desktop: kategori artikel / artikel terbaru                                           |
+-----------------------------------------------------------------------------------------------+
```

### 5.11 Arah visual

- nuansa hijau muda sebagai warna dominan
- aksen hijau daun dan krem netral agar tidak terasa klinis
- kartu produk ringan, border tipis, radius sedang
- tipografi modern dan bersih, tanpa nuansa toko online lama
- foto produk dominan putih / netral agar warna produk jelas

## Tahap 6 - Rekomendasi stack

### 6.1 Backend

- `FastAPI`
- `SQLAlchemy 2.x`
- `Alembic`

Alasan:

- cepat untuk membangun API typed dan dokumentasi OpenAPI
- cocok untuk modular monolith
- mudah disejajarkan dengan backend SiGe Manajer yang sudah ada

### 6.2 Database

- `PostgreSQL 16`

Alasan:

- constraint dan transaksi kuat
- enak untuk full-text search, JSONB, dan indexing multi-tenant
- cocok untuk skala menengah hingga besar di VPS

### 6.3 Cache

- `Redis`

Alasan:

- cocok untuk OTP, rate limit, session, cache singkat, dan distributed locking

### 6.4 Queue

- `Celery + Redis broker`

Alasan:

- matang untuk background jobs
- selaras dengan arah backend SiGe Manajer
- cocok untuk sync retry, invoice PDF, dan auto-cancel order

### 6.5 Storage

- `S3-compatible storage` seperti MinIO / object storage hosting

Alasan:

- aman untuk media, banner, dan invoice PDF
- memudahkan CDN di tahap berikutnya

### 6.6 Frontend web

- `Next.js App Router`
- `TypeScript`
- `TanStack Query`
- `Tailwind CSS + design tokens CSS variables`
- `next/image`

Alasan:

- kuat untuk SEO, server rendering, dan metadata
- cache client tetap rapi
- frontend tetap ringan dan modern untuk desktop dan mobile

### 6.7 Android app

- `Kotlin`
- `Jetpack Compose`
- `Room`
- `WorkManager`
- `Retrofit atau Ktor client`

Alasan:

- offline cache dan retry job native jauh lebih kuat
- Compose mempercepat iterasi UI

### 6.8 Payment gateway Duitku

- integrasi backend server-to-server
- callback masuk ke backend, bukan langsung ke web atau Android

Alasan:

- signature dan amount bisa diverifikasi server-side
- state pembayaran tetap konsisten

### 6.9 PDF invoice

- `ReportLab`

Alasan:

- lebih ringan untuk deploy Python di VPS
- layout nota putih dan merah mudah dikontrol

### 6.10 SEO

- Next.js Metadata API
- sitemap generator
- robots.txt
- JSON-LD structured data

Alasan:

- SEO harus baked-in dari awal

### 6.11 Deployment VPS

- `Docker Compose`
- `Nginx`
- `Uvicorn / Gunicorn`
- PostgreSQL dan Redis sebagai service terpisah

Alasan:

- realistis untuk hosting yang sudah tersedia
- mudah dioperasikan tim kecil

### 6.12 Monitoring / logging

- `Prometheus`
- `Grafana`
- `Loki`
- `Sentry`

Alasan:

- memantau API, worker, sync failure, dan error klien

## Tahap 7 - Implementasi

Urutan implementasi saya pertahankan sesuai permintaan: backend dulu, lalu web, lalu Android.

### 7.1 Backend terlebih dahulu

1. bootstrap project
2. migration
3. model
4. auth
5. katalog produk
6. promo
7. cart
8. checkout
9. order
10. payment
11. shipment tracking
12. invoice
13. content management
14. banner
15. SEO
16. cache / offline support

Rincian backend:

- bootstrap project: monorepo, config env, dependency, router dasar
- migration: tabel inti, constraint, index
- model: master data, cart, order, payment, shipment, invoice, sync log
- auth: Google OIDC, WhatsApp OTP, guest token, operator auth terpisah
- katalog produk: category, product, price, image, video, search, sort, filter
- promo: engine `BUY_X_GET_Y`, publish dari SiGe, operator override terbatas
- cart: guest cart, authenticated cart, merge cart
- checkout: validasi cart, shipping/pickup, payment selection, order creation
- order: lifecycle, auto-cancel 24 jam, tracking, sync status
- payment: create transaction Duitku, callback handler, push ke SiGe
- shipment tracking: shipment record, tracking number, timeline
- invoice: nota putih, nota merah, shipping label
- content management: halaman statis, artikel/blog
- banner: homepage banner dan variant mobile
- SEO: metadata, sitemap, robots, structured data
- cache/offline support: delta sync, manifest cache, retry worker

### 7.2 Web frontend setelah backend stabil

17. web frontend

Rincian:

- homepage, katalog, detail produk
- cart, checkout, tracking order
- responsive desktop dan mobile
- service worker + IndexedDB cache

### 7.3 Android app terakhir

18. Android app

Rincian:

- flow guest browsing
- login
- cart
- checkout
- order history
- cache Room + WorkManager

### 7.4 Strategi implementasi realistis

Fase 1:

- backend foundation
- katalog read model
- guest cart
- guest checkout
- Duitku integration
- tracking order

Fase 2:

- login customer
- wishlist
- article/blog
- promo kompleks
- operator panel ringan

Fase 3:

- Android app penuh
- ongkir otomatis
- perluasan nasional

## Tahap 8 - Testing dan deployment

### 8.1 Unit test

- service katalog
- promo engine
- cart pricing
- guest checkout validator
- payment callback verifier
- sync delta builder

### 8.2 Integration test

- katalog list dan detail
- guest checkout end-to-end
- create payment Duitku
- callback Duitku mengubah status payment
- order tracking
- delta sync inbound dan outbound

### 8.3 Dokumentasi API

- OpenAPI dari FastAPI
- contoh payload public, customer, admin, sync
- error code dan idempotency rule

### 8.4 Dokumentasi instalasi

- requirement environment
- cara menjalankan docker compose
- migration
- seed data awal
- menjalankan worker

### 8.5 `.env.example`

Harus memuat:

- `APP_NAME`
- `APP_ENV`
- `API_PREFIX`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET_KEY`
- `FERNET_KEY`
- `DUITKU_MERCHANT_CODE`
- `DUITKU_API_KEY`
- `DUITKU_CALLBACK_SECRET`
- `SIGE_SYNC_BASE_URL`
- `SIGE_SYNC_TOKEN`
- `OBJECT_STORAGE_*`
- `CORS_ORIGINS`

### 8.6 Docker / Docker Compose

Service minimal:

- `api`
- `worker`
- `postgres`
- `redis`
- `minio`
- `nginx`

### 8.7 Checklist deployment VPS

- domain dan subdomain diarahkan
- TLS aktif
- env production aman
- backup database aktif
- volume persistent terpasang
- health check dan restart policy aktif
- firewall membatasi port
- scheduler auto-cancel order aktif

### 8.8 Checklist keamanan

- secret default diganti
- callback gateway diverifikasi
- rate limiting login dan OTP aktif
- CORS ketat
- audit log sync aktif
- storage private default
- admin auth dipisahkan dari customer auth

## Referensi resmi yang mendasari keputusan stack

- Duitku docs: https://docs.duitku.com/
- Next.js docs: https://nextjs.org/docs
- SQLAlchemy 2.0 docs: https://docs.sqlalchemy.org/20/intro.html
- Android Developers: https://developer.android.com/
