# Kios Sidomakmur Backend

Backend storefront untuk Kios Sidomakmur.

## Modul inti

- `storefront`: katalog, halaman statis, banner, SEO
- `customer`: guest cart, checkout, tracking order, auth customer
- `payments`: pembuatan pembayaran Duitku dan callback
- `sync`: delta cache dan outbox integrasi SiGe Manajer

## Menjalankan lokal

1. Install dependency:

```powershell
python -m pip install -e .[dev]
```

2. Salin env:

```powershell
Copy-Item .env.example .env
```

3. Jalankan API:

```powershell
uvicorn app.main:app --reload
```

4. Jalankan test:

```powershell
pytest
```

## Sync katalog dari SiGe Manajer

Isi env berikut agar backend `Kios Sidomakmur` menarik delta katalog dari `SiGe Manajer`:

- `SIGE_SYNC_BASE_URL`
- `SIGE_SYNC_TOKEN`
- `SIGE_SYNC_TARGET_CODE=SIDOMAKMUR_KIOS`

Setelah env aktif, backend akan mencoba pull delta saat startup. Untuk trigger manual:

```powershell
curl -X POST "http://localhost:8000/api/v1/sync/pull-from-sige?store_code=SIDO-JATIM-ONLINE&force_full=true"
```
