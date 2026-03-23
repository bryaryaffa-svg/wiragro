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
- URL gambar `https://api.wiragro.id/storage/...` bisa diakses

## Catatan Hostinger

- jangan biarkan `APP_DEBUG=true` di production
- jangan pakai `localhost` untuk `APP_URL`, `FRONTEND_URL`, atau CORS origin
- kalau panel tidak bisa mengubah document root, perlu strategi deploy Laravel khusus Hostinger agar isi `public/` menjadi root web

## Kredensial Seeder Awal

Seeder default membuat admin:

- email: `admin@wiragro.id`
- password: `Admin12345`

Segera ganti password ini setelah deploy pertama.
