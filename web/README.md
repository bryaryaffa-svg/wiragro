# Web Frontend Kios Sidomakmur

Implementasi fase awal storefront web sudah tersedia dengan:

- Next.js App Router + TypeScript
- homepage, katalog, detail produk
- guest cart berbasis backend
- guest checkout + create payment Duitku
- login Google OIDC + login WhatsApp OTP
- wishlist customer
- tracking pesanan
- halaman statis dan artikel
- sitemap, robots, web manifest

## Menjalankan lokal

1. Siapkan env:

```powershell
Copy-Item .env.example .env
```

Isi minimal:

- `PUBLIC_API_BASE_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_CUSTOMER_API_BASE_URL=http://localhost:8001/api/v1`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

2. Install dependency:

```powershell
npm install
```

3. Jalankan backend Laravel publik terlebih dahulu pada `http://localhost:8000`

4. Jika flow cart / checkout / auth customer masih memakai backend lama, jalankan backend customer di `http://localhost:8001`

5. Jalankan web:

```powershell
npm run dev
```

## Catatan integrasi

- katalog publik sekarang dibaca dari backend Laravel melalui `PUBLIC_API_BASE_URL` / `API_BASE_URL`
- endpoint Laravel yang dipakai web:
  - `/api/v1/public/store`
  - `/api/v1/public/categories`
  - `/api/v1/public/products`
  - `/api/v1/public/banners`
- flow customer yang belum dipindahkan ke Laravel tetap memakai `NEXT_PUBLIC_CUSTOMER_API_BASE_URL`
- kompatibilitas lama tetap dijaga dengan `NEXT_PUBLIC_API_BASE_URL` sebagai fallback customer API

## Deploy ke Hostinger dari GitHub

Repo ini adalah monorepo, jadi deploy web harus memakai folder root `web`.

Pengaturan yang disarankan:

- framework preset: `Next.js`
- branch production: `main`
- root directory: `web`
- Node.js version: `22.x`

Environment variable minimum yang harus diisi di Hostinger:

- `PUBLIC_API_BASE_URL=https://api.wiragro.id/api`
- `API_BASE_URL=https://api.wiragro.id/api`
- `NEXT_PUBLIC_CUSTOMER_API_BASE_URL=https://CUSTOMER-API-ANDA/api/v1`
- `NEXT_PUBLIC_API_BASE_URL=https://CUSTOMER-API-ANDA/api/v1`
- `STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_SITE_URL=https://wiragro.id`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

Catatan:

- `PUBLIC_API_BASE_URL` dan `API_BASE_URL` harus menunjuk ke backend Laravel publik, bukan `localhost`.
- bila flow customer masih memakai backend lama, isi `NEXT_PUBLIC_CUSTOMER_API_BASE_URL` dengan URL backend customer yang masih aktif.
- jika semua flow customer nantinya juga dipindahkan ke Laravel, `NEXT_PUBLIC_CUSTOMER_API_BASE_URL` bisa diarahkan ke backend baru yang sama.
- Jika backend memproteksi CORS, origin `https://wiragro.id` dan bila perlu `https://www.wiragro.id` harus diizinkan.
- Google Sign-In production juga harus mengizinkan origin domain yang sama.
