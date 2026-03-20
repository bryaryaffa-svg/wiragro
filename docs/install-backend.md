# Instalasi Backend Kios Sidomakmur

## Prasyarat

- Python 3.12+
- PostgreSQL 16 untuk production
- Redis untuk cache dan queue
- Docker dan Docker Compose untuk deployment VPS

## Menjalankan lokal cepat

1. Masuk ke folder backend:

```powershell
cd kios-sidomakmur\backend
```

2. Install dependency:

```powershell
python -m pip install -e .[dev] --user
```

3. Siapkan env:

```powershell
Copy-Item .env.example .env
```

4. Jalankan API:

```powershell
uvicorn app.main:app --reload
```

5. Jalankan test:

```powershell
& "$env:APPDATA\Python\Python314\Scripts\pytest.exe"
```

## Menjalankan dengan Docker Compose

```powershell
docker compose up --build
```

Catatan:

- untuk local demo, backend bisa berjalan dengan SQLite jika `DATABASE_URL` tetap default
- untuk staging/production, ganti `DATABASE_URL` ke PostgreSQL
- aktifkan kredensial Duitku dan endpoint SiGe Manajer sebelum integrasi live
