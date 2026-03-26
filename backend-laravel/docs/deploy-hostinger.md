# Deploy Backend Laravel MVP ke `api.wiragro.id`

Panduan ini fokus untuk men-deploy `backend-laravel/` ke Hostinger sebagai backend publik untuk website `wiragro.id`.

## Target Arsitektur

- frontend publik: `https://wiragro.id`
- backend API + admin: `https://api.wiragro.id`
- database: MySQL terpusat

## Prasyarat

- subdomain `api.wiragro.id` sudah dibuat
- hosting target mendukung PHP 8.2+
- database MySQL sudah tersedia
- Anda bisa mengubah document root ke folder `public` Laravel

## File Env Production

Gunakan [`.env.production.example`](C:/Users/BRYAN/OneDrive/Dokumen/Playground/kios-sidomakmur/backend-laravel/.env.production.example) sebagai dasar.

Nilai minimum yang harus diisi:

```env
APP_NAME="SiGe Manager"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.wiragro.id
FRONTEND_URL=https://wiragro.id
ADMIN_URL=https://api.wiragro.id/admin
DEFAULT_STORE_CODE=SIDO-JATIM-ONLINE
DEFAULT_CURRENCY=IDR
ORDER_AUTO_CANCEL_HOURS=24
GUEST_MINIMUM_ORDER_AMOUNT=0
CHECKOUT_SHIPPING_METHODS=delivery,pickup
CHECKOUT_PAYMENT_METHODS=duitku-va,COD
CHECKOUT_INVOICE_SOURCE=STORE
GOOGLE_OIDC_AUDIENCES=YOUR_GOOGLE_WEB_CLIENT_ID
CUSTOMER_OTP_EXPIRY_SECONDS=300
CUSTOMER_OTP_DEBUG_CODE=
CUSTOMER_ACCESS_TOKEN_NAME=web-customer
DUITKU_MERCHANT_CODE=YOUR_DUITKU_MERCHANT_CODE
DUITKU_PAYMENT_MODE=server-stub-until-merchant-credentials-enabled
DUITKU_SANDBOX_PAYMENT_URL=https://sandbox.duitku.com/topup/topupdirectv2.aspx

DB_CONNECTION=mysql
DB_HOST=YOUR_MYSQL_HOST
DB_PORT=3306
DB_DATABASE=YOUR_MYSQL_DATABASE
DB_USERNAME=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD

SESSION_DOMAIN=.wiragro.id
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=wiragro.id,www.wiragro.id
CORS_ALLOWED_ORIGINS=https://wiragro.id,https://www.wiragro.id

FILESYSTEM_DISK=public
```

## Langkah Deploy

1. Upload source folder `backend-laravel/` ke server.
2. Jalankan `composer install --no-dev --optimize-autoloader`.
3. Copy `.env.production.example` menjadi `.env`.
4. Generate key:

```bash
php artisan key:generate
```

5. Jalankan migration dan seed:

```bash
php artisan migrate --seed --force
```

6. Buat symbolic link storage:

```bash
php artisan storage:link
```

7. Cache config dan route:

```bash
php artisan config:cache
php artisan route:cache
```

8. Pastikan document root diarahkan ke folder `public/`.

## Checklist Setelah Deploy

- `https://api.wiragro.id/` merespons JSON status
- `https://api.wiragro.id/up` merespons health check
- `https://api.wiragro.id/api/v1/public/store` merespons JSON toko
- `https://api.wiragro.id/api/v1/public/products` merespons daftar produk
- `https://api.wiragro.id/api/v1/admin/login` bisa dipanggil via Postman
- `https://api.wiragro.id/api/v1/customer/carts/guest` bisa membuat guest cart
- `https://api.wiragro.id/api/v1/customer/orders/track?order_number=...&phone=...` bisa melacak order guest
- `https://api.wiragro.id/api/v1/customer/orders/{orderNumber}?phone=...` bisa membuka detail order guest
- `https://api.wiragro.id/api/v1/customer/auth/google` bisa login customer Google
- `https://api.wiragro.id/api/v1/customer/auth/whatsapp/request-otp` bisa request OTP
- `https://api.wiragro.id/api/v1/customer/wishlist` bisa diakses dengan Bearer token customer
- `https://api.wiragro.id/api/v1/customer/payments/duitku/create` bisa membuat link pembayaran stub
- URL gambar `https://api.wiragro.id/storage/...` bisa diakses
- Google Cloud Console OAuth client harus mengizinkan:
  - `https://wiragro.id`
  - `https://www.wiragro.id`

## Catatan Hostinger

- jangan biarkan `APP_DEBUG=true` di production
- jangan pakai `localhost` untuk `APP_URL`, `FRONTEND_URL`, atau CORS origin
- kalau panel tidak bisa mengubah document root, perlu strategi deploy Laravel khusus Hostinger agar isi `public/` menjadi root web

## Kredensial Seeder Awal

Seeder default membuat admin:

- email: `admin@wiragro.id`
- password: `Admin12345`

Segera ganti password ini setelah deploy pertama.
