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
