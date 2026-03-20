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
