# Deploy Web ke Hostinger

Panduan ini khusus untuk deploy frontend web `wiragro.id` dari repo GitHub monorepo ini.

## Source Repo

- repository: `https://github.com/bryaryaffa-svg/wiragro.git`
- branch production: `main`
- folder aplikasi web: `web`

## Setting Hostinger yang Disarankan

- preset framework: `Next.js`
- branch: `main`
- root directory: `web`
- Node.js version: `22.x`
- build/output: default Next.js

## Environment Variable Wajib

Isi di dashboard Hostinger:

```text
API_BASE_URL=https://API-ANDA/api/v1
NEXT_PUBLIC_API_BASE_URL=https://API-ANDA/api/v1
STORE_CODE=SIDO-JATIM-ONLINE
NEXT_PUBLIC_STORE_CODE=SIDO-JATIM-ONLINE
NEXT_PUBLIC_SITE_URL=https://wiragro.id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=113842081997-b3otlfb7thkjalpkmf9pedor5ufrf4eb.apps.googleusercontent.com
```

## Yang Masih Harus Siap di Sisi Backend

- backend publik harus aktif, misalnya `https://api.wiragro.id/api/v1`
- CORS backend harus mengizinkan:
  - `https://wiragro.id`
  - `https://www.wiragro.id` bila domain `www` ikut dipakai
- audience Google di backend harus tetap menerima Web Client ID yang sama

## Verifikasi Setelah Deploy

1. homepage bisa dibuka
2. katalog bisa memuat produk
3. detail produk berhasil fetch dari backend
4. cart dan checkout guest berjalan
5. halaman artikel dan statis tampil
6. Google sign-in tidak gagal karena origin mismatch

## Catatan Penting

- app web ini adalah Next.js server app, bukan static export.
- deploy akan gagal atau app tidak berfungsi penuh bila environment variable masih menunjuk ke `localhost`.
