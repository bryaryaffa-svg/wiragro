# Android App Kios Sidomakmur

Implementasi Android sekarang sudah mencakup:

- Kotlin + Jetpack Compose
- Retrofit + Moshi untuk konsumsi API storefront dan customer API
- homepage katalog yang membaca backend Kios Sidomakmur
- login member dengan Google OIDC Android
- login reseller dengan username + password
- aktivasi reseller dan set password pertama kali
- wishlist customer yang tersimpan ke backend
- detail produk dengan galeri, promo aktif, video, dan produk terkait
- mode harga reseller yang mengikuti backend
- cart authenticated
- checkout Android dengan aturan reseller minimum order
- opsi kirim langsung oleh toko / ambil di toko
- opsi COD
- ringkasan order dan nota dari toko/backend
- riwayat pesanan akun
- detail pesanan akun
- tombol pembayaran Duitku dari detail pesanan

## Menjalankan lokal

1. Pastikan backend berjalan terlebih dahulu.

2. Masuk ke folder Android:

```powershell
cd C:\Users\BRYAN\OneDrive\Dokumen\Playground\kios-sidomakmur\android
```

3. Untuk emulator Android, default API base URL sudah mengarah ke:

```text
http://10.0.2.2:8000/api/v1/
```

4. Build debug APK:

```powershell
.\gradlew.bat --no-daemon :app:assembleDebug
```

5. Jika project berada di OneDrive, output APK debug akan diarahkan ke:

```text
C:\Users\BRYAN\AppData\Local\KiosSidomakmurBuild\app\outputs\apk\debug\app-debug.apk
```

## Override konfigurasi build

Base URL backend untuk HP fisik:

```powershell
$env:KIOS_API_BASE_URL="http://IP-PC-ANDA:8000/api/v1/"
.\gradlew.bat --no-daemon :app:assembleDebug
```

Override store code:

```powershell
$env:KIOS_STORE_CODE="SIDO-JATIM-ONLINE"
```

Aktifkan login Google Android dengan Web Client ID Google yang sama untuk minting ID token ke backend:

```powershell
$env:KIOS_GOOGLE_SERVER_CLIENT_ID="YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com"
.\gradlew.bat --no-daemon :app:assembleDebug
```

Catatan:

- Google login di emulator butuh image emulator yang punya Google Play / Play Store.
- Pastikan backend juga menerima audience yang sama di `GOOGLE_OIDC_AUDIENCES`.
- Kalau client ID belum diisi, tombol Google tetap tampil tetapi akan memberi pesan konfigurasi belum lengkap.
- Untuk flow reseller demo lokal, backend akan menyediakan username `reseller-demo` yang bisa diaktivasi dari app.

## Cakupan fase Android saat ini

- beranda Android
- preview banner aktif
- kategori cepat
- produk unggulan
- produk terbaru
- produk terlaris
- preview katalog umum
- login Google
- login reseller
- aktivasi password reseller
- session customer lokal
- wishlist customer
- detail produk
- cart Android
- checkout Android
- role-aware pricing untuk member vs reseller
- validasi minimum order reseller Rp500.000
- COD dan kirim langsung oleh toko
- riwayat pesanan authenticated
- detail pesanan authenticated
- create payment link Duitku dari Android

## Tahap berikutnya

- payment Duitku Android flow
- riwayat pesanan dan tracking
- Room cache untuk offline
- WorkManager untuk retry sync
