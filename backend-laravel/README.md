# Backend Laravel MVP SiGe Manager

Skeleton ini adalah backend Laravel baru untuk SiGe Manager dan API publik Kios Sidomakmur.

## Tujuan MVP

- admin login
- CRUD kategori
- CRUD produk
- upload gambar produk
- update stok + riwayat perubahan stok
- CRUD banner
- update pengaturan toko
- endpoint public untuk website
- endpoint admin yang diproteksi login
- guest cart
- guest checkout
- pelacakan order guest

## Struktur utama

- `app/Http/Controllers/Api/Admin` untuk endpoint admin
- `app/Http/Controllers/Api/PublicApi` untuk endpoint website
- `app/Http/Requests` untuk validasi request
- `app/Models` untuk model inti
- `database/migrations` untuk tabel MVP
- `database/seeders` untuk data awal
- `routes/api.php` untuk pemisahan route `v1/public` dan `v1/admin`

## Catatan penting

Environment kerja saat ini tidak memiliki `php` dan `composer`, jadi skeleton ini ditulis langsung ke repo dan belum dapat dijalankan di mesin ini. Agar runnable:

1. install PHP 8.2+
2. install Composer
3. jalankan:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Contoh endpoint

- `POST /api/v1/admin/login`
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{product}/stock`
- `GET /api/v1/public/products`
- `GET /api/v1/public/banners`
- `POST /api/v1/customer/carts/guest`
- `GET /api/v1/customer/carts/current`
- `POST /api/v1/customer/carts/items`
- `PATCH /api/v1/customer/carts/items/{item}`
- `POST /api/v1/customer/checkout/guest`
- `GET /api/v1/customer/orders/track`
- `GET /api/v1/customer/orders/{orderNumber}?phone=...`

## Env production minimum

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.wiragro.id
FRONTEND_URL=https://wiragro.id
DEFAULT_STORE_CODE=SIDO-JATIM-ONLINE
DEFAULT_CURRENCY=IDR
ORDER_AUTO_CANCEL_HOURS=24
CHECKOUT_SHIPPING_METHODS=delivery,pickup
CHECKOUT_PAYMENT_METHODS=duitku-va,COD
CHECKOUT_INVOICE_SOURCE=STORE
ADMIN_URL=https://api.wiragro.id/admin
DB_HOST=YOUR_MYSQL_HOST
DB_PORT=3306
DB_DATABASE=YOUR_MYSQL_DB
DB_USERNAME=YOUR_MYSQL_USER
DB_PASSWORD=YOUR_MYSQL_PASSWORD
SANCTUM_STATEFUL_DOMAINS=wiragro.id,www.wiragro.id
SESSION_DOMAIN=.wiragro.id
CORS_ALLOWED_ORIGINS=https://wiragro.id,https://www.wiragro.id
FILESYSTEM_DISK=public
```

File contoh production lengkap ada di [`.env.production.example`](C:/Users/BRYAN/OneDrive/Dokumen/Playground/kios-sidomakmur/backend-laravel/.env.production.example).

## Deploy ke Hostinger

Panduan deploy operasional ada di [deploy-hostinger.md](C:/Users/BRYAN/OneDrive/Dokumen/Playground/kios-sidomakmur/backend-laravel/docs/deploy-hostinger.md).
