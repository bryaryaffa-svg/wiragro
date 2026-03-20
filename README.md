# Kios Sidomakmur

Monorepo aplikasi Kios Sidomakmur yang terdiri dari:

- backend FastAPI yang terintegrasi ke SiGe Manajer
- storefront web Next.js
- aplikasi Android Kotlin + Jetpack Compose

Repo ini disiapkan untuk workflow `main -> feature branch -> pull request -> review -> merge`, sehingga perubahan dari Codex tidak langsung masuk ke branch production.

## Struktur Repo

- `backend/`
  Backend API, auth, katalog, cart, checkout, payment, order, sync SiGe.
- `web/`
  Frontend web Next.js App Router untuk desktop dan mobile browser.
- `android/`
  Aplikasi Android native dengan Jetpack Compose.
- `docs/`
  Blueprint solusi, instalasi, dan catatan implementasi.
- `.github/`
  Template PR, issue, dan workflow CI dasar.
- `AGENTS.md`
  Instruksi kerja untuk Codex/agent pada repo ini.

## Prasyarat Lokal

- Python `3.12+`
- Node.js `20+`
- Java `17`
- Android Studio untuk build/run Android

## Konfigurasi Environment

File sensitif tidak disimpan ke repo. Gunakan file contoh berikut:

- backend: `backend/.env.example`
- web: `web/.env.example`
- android: `android/local.properties.example`

File lokal yang tidak boleh dipush:

- `backend/.env`
- `web/.env`
- `android/local.properties`

## Menjalankan Backend

```powershell
cd backend
Copy-Item .env.example .env
python -m pip install -e .[dev]
uvicorn app.main:app --reload
```

Test backend:

```powershell
cd backend
pytest
```

## Menjalankan Web

```powershell
cd web
Copy-Item .env.example .env
npm install
npm run dev
```

Build production web:

```powershell
cd web
npm run build
npm run start
```

## Menjalankan Android

```powershell
cd android
.\gradlew.bat --no-daemon :app:assembleDebug
.\gradlew.bat --no-daemon :app:testDebugUnitTest
```

Untuk Android, isi `android/local.properties` berdasarkan `android/local.properties.example`.

## Validasi Minimum Sebelum PR

- backend:
  `pytest`
- web:
  `npm run build`
- android:
  `.\gradlew.bat --no-daemon :app:assembleDebug`
  `.\gradlew.bat --no-daemon :app:testDebugUnitTest`

## Strategi Branch

- `main`
  branch production yang selalu dijaga stabil
- `codex/<task-singkat>`
  branch kerja agent/Codex
- `feature/<task-singkat>`
  branch kerja manual developer jika diperlukan

Aturan:

- jangan commit langsung ke `main`
- semua perubahan masuk lewat pull request
- merge ke `main` hanya setelah review dan validasi lulus

## Catatan Deploy

- `web/` adalah Next.js server app, bukan static export murni. Untuk Hostinger, gunakan hosting yang mendukung Node.js atau deploy melalui VPS/container.
- `backend/` perlu service terpisah dan env production sendiri.
- `android/` tidak dipakai untuk deploy Hostinger, tetapi tetap dijaga di monorepo yang sama.

## Dokumen Tambahan

- [Blueprint solusi](docs/solution-blueprint.md)
- [Panduan instalasi backend](docs/install-backend.md)
