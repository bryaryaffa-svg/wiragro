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
PUBLIC_API_BASE_URL=https://api.wiragro.id/api
API_BASE_URL=https://api.wiragro.id/api
NEXT_PUBLIC_API_BASE_URL=https://api.wiragro.id/api/v1
STORE_CODE=SIDO-JATIM-ONLINE
NEXT_PUBLIC_STORE_CODE=SIDO-JATIM-ONLINE
NEXT_PUBLIC_SITE_URL=https://wiragro.id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=113842081997-b3otlfb7thkjalpkmf9pedor5ufrf4eb.apps.googleusercontent.com
```

Override opsional jika ingin memisahkan base URL public dan customer secara eksplisit:

```text
NEXT_PUBLIC_PUBLIC_API_BASE_URL=https://api.wiragro.id/api
NEXT_PUBLIC_CUSTOMER_API_BASE_URL=https://api.wiragro.id/api/v1
```

## Yang Masih Harus Siap di Sisi Backend

- backend Laravel publik harus aktif, misalnya `https://api.wiragro.id/api`
- endpoint customer Laravel juga harus aktif di `https://api.wiragro.id/api/v1/customer/*`
- CORS backend harus mengizinkan:
  - `https://wiragro.id`
  - `https://www.wiragro.id` bila domain `www` ikut dipakai
- audience Google di backend harus tetap menerima Web Client ID yang sama

## Verifikasi Setelah Deploy

1. homepage bisa dibuka
2. katalog bisa memuat produk
3. detail produk berhasil fetch dari backend
4. halaman statis tampil
5. cart, checkout guest, auth customer, wishlist, dan tracking pesanan berjalan dari backend Laravel yang sama
6. Google sign-in tidak gagal karena origin mismatch

## Catatan Penting

- app web ini adalah Next.js server app, bukan static export.
- deploy akan gagal atau app tidak berfungsi penuh bila environment variable masih menunjuk ke `localhost`.
- untuk full cutover, semua env web di atas harus menunjuk ke `api.wiragro.id` dan bukan backend lama.
- checkout guest web sekarang hanya membuat payment Duitku bila metode pembayaran memang `duitku-va`; untuk guest flow, backend juga memverifikasi `customer_phone` sebelum membuat payment link.
