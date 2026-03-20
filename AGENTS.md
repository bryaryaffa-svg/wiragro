# AGENTS

Instruksi kerja untuk Codex dan agent lain pada repo `kios-sidomakmur`.

## Prinsip Utama

- Jangan ubah branch `main` secara langsung.
- Kerjakan semua perubahan pada branch kerja, idealnya `codex/<task-singkat>`.
- Ajukan hasil sebagai pull request ke `main`.
- Jaga perubahan tetap kecil, fokus, dan mudah direview.
- Jangan commit file sensitif, file lokal, atau build artifact.

## Struktur Repo

- `backend/`: FastAPI storefront dan integrasi SiGe
- `web/`: Next.js storefront
- `android/`: Android native
- `docs/`: blueprint dan dokumen teknis

## Cara Bekerja

1. Baca konteks repo dan file yang relevan terlebih dahulu.
2. Buat perubahan hanya pada area yang diperlukan.
3. Jangan reformat repo secara massal bila tidak diminta.
4. Jangan ubah kontrak API/backend secara luas tanpa alasan yang jelas.
5. Bila menyentuh lebih dari satu app, jelaskan dependensi silang di PR.

## Workflow Git

- branch production: `main`
- branch kerja Codex: `codex/<task-singkat>`
- branch feature manual: `feature/<task-singkat>`

Aturan:

- jangan push langsung ke `main`
- semua perubahan lewat PR
- pakai judul branch yang ringkas dan deskriptif

## Validasi Sebelum Mengajukan PR

Jalankan hanya validasi yang relevan dengan area yang diubah, lalu sebutkan hasilnya di PR.

- backend
  - `cd backend`
  - `pytest`
- web
  - `cd web`
  - `npm run build`
- android
  - `cd android`
  - `.\gradlew.bat --no-daemon :app:assembleDebug`
  - `.\gradlew.bat --no-daemon :app:testDebugUnitTest`

## File Sensitif dan Lokal

Jangan commit file berikut:

- `backend/.env`
- `web/.env`
- `android/local.properties`
- database lokal
- output build, cache, APK/AAB

Gunakan file contoh:

- `backend/.env.example`
- `web/.env.example`
- `android/local.properties.example`

## Catatan Bisnis Penting

- Kios Sidomakmur bukan source of truth utama.
- Data penting harus tetap mengikuti backend/SiGe.
- Jangan hardcode rule bisnis yang seharusnya datang dari backend.
- Untuk harga, role, promo, checkout rules, dan status order, backend adalah sumber keputusan.

## Catatan Deploy

- `web/` membutuhkan hosting Node.js atau VPS/container.
- `backend/` dijalankan sebagai service terpisah.
- Hostinger hanya relevan untuk web/backend deploy, bukan Android.

## Isi PR yang Diharapkan

- ringkasan perubahan
- alasan teknis singkat
- area yang terdampak
- validasi yang dijalankan
- risiko atau follow-up bila ada

