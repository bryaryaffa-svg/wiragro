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
- `API_BASE_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

Opsional jika ingin override eksplisit:

- `NEXT_PUBLIC_PUBLIC_API_BASE_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_CUSTOMER_API_BASE_URL=http://localhost:8000/api/v1`

2. Install dependency:

```powershell
npm install
```

3. Jalankan backend Laravel terlebih dahulu pada `http://localhost:8000`

4. Jalankan web:

```powershell
npm run dev
```

## Catatan integrasi

- katalog publik sekarang dibaca dari backend Laravel melalui `PUBLIC_API_BASE_URL` / `API_BASE_URL`
- flow customer untuk guest cart, checkout, tracking, auth customer, wishlist, logout, dan create payment juga diarahkan ke backend Laravel yang sama
- endpoint Laravel yang dipakai web:
  - `/api/v1/public/store`
  - `/api/v1/public/categories`
  - `/api/v1/public/products`
  - `/api/v1/public/banners`
  - `/api/v1/customer/carts/guest`
  - `/api/v1/customer/carts/current`
  - `/api/v1/customer/checkout/guest`
  - `/api/v1/customer/orders/track`
  - `/api/v1/customer/auth/google`
  - `/api/v1/customer/auth/whatsapp/request-otp`
  - `/api/v1/customer/auth/whatsapp/verify-otp`
  - `/api/v1/customer/wishlist`
  - `/api/v1/customer/payments/duitku/create`

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
- `NEXT_PUBLIC_API_BASE_URL=https://api.wiragro.id/api/v1`
- `STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_SITE_URL=https://wiragro.id`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

Opsional jika ingin override eksplisit:

- `NEXT_PUBLIC_PUBLIC_API_BASE_URL=https://api.wiragro.id/api`
- `NEXT_PUBLIC_CUSTOMER_API_BASE_URL=https://api.wiragro.id/api/v1`

Catatan:

- `PUBLIC_API_BASE_URL` dan `API_BASE_URL` harus menunjuk ke backend Laravel publik, bukan `localhost`.
- `NEXT_PUBLIC_API_BASE_URL` harus menunjuk ke path customer Laravel, yaitu `/api/v1`.
- bila override dipakai, `NEXT_PUBLIC_PUBLIC_API_BASE_URL` dan `NEXT_PUBLIC_CUSTOMER_API_BASE_URL` tetap harus menunjuk ke domain Laravel yang sama untuk full cutover.
- Jika backend memproteksi CORS, origin `https://wiragro.id` dan bila perlu `https://www.wiragro.id` harus diizinkan.
- Google Sign-In production juga harus mengizinkan origin domain yang sama.
