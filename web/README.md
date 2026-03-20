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

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

2. Install dependency:

```powershell
npm install
```

3. Jalankan backend terlebih dahulu pada `http://localhost:8000`

4. Jalankan web:

```powershell
npm run dev
```

## Catatan integrasi

- API publik dipakai dari prefix `/api/v1/storefront`
- guest cart dan checkout memakai `/api/v1/customer`
- login Google mengirim Google ID token ke `/api/v1/customer/auth/google`
- create payment memakai `/api/v1/customer/payments/duitku/create`
- cache manifest awal memakai `/api/v1/sync/cache-manifest`

## Deploy ke Hostinger dari GitHub

Repo ini adalah monorepo, jadi deploy web harus memakai folder root `web`.

Pengaturan yang disarankan:

- framework preset: `Next.js`
- branch production: `main`
- root directory: `web`
- Node.js version: `22.x`

Environment variable minimum yang harus diisi di Hostinger:

- `API_BASE_URL=https://API-ANDA/api/v1`
- `NEXT_PUBLIC_API_BASE_URL=https://API-ANDA/api/v1`
- `STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_STORE_CODE=SIDO-JATIM-ONLINE`
- `NEXT_PUBLIC_SITE_URL=https://wiragro.id`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>`

Catatan:

- `API_BASE_URL` dan `NEXT_PUBLIC_API_BASE_URL` harus menunjuk ke backend publik, bukan `localhost`.
- Jika backend memproteksi CORS, origin `https://wiragro.id` dan bila perlu `https://www.wiragro.id` harus diizinkan.
- Google Sign-In production juga harus mengizinkan origin domain yang sama.
