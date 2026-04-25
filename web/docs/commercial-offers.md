# Operasional Bundle dan Campaign Wiragro

Dokumen ini menjelaskan pola file-based yang dipakai untuk menambah lini penawaran komersial Wiragro tanpa edit manual yang berantakan.

## Source of Truth

- Bundle disimpan di `web/lib/commercial-content/bundles.ts`
- Campaign disimpan di `web/lib/commercial-content/campaigns.ts`
- Query layer publik tetap di:
  - `web/lib/growth-commerce.ts`
  - `web/lib/campaign-content.ts`
- Validator build ada di `web/lib/static-content-validation.ts`

Tim sebaiknya menambah atau mengubah data komersial dari file source di folder `commercial-content`, bukan langsung mengutak-atik getter atau halaman.

## Format Data

Setiap bundle dan campaign punya blok `ops`:

```ts
ops: {
  status: "active" | "inactive",
  priority: 100,
  schedule?: {
    startsAt?: "2026-11-01T00:00:00+07:00",
    endsAt?: "2026-12-15T23:59:59+07:00",
  },
}
```

Aturan operasional:

- `status: "active"` berarti offer siap ikut query publik, selama jendela schedule-nya sedang live.
- `status: "inactive"` berarti offer tetap tervalidasi saat build, tetapi tidak muncul di halaman publik.
- `priority` menentukan urutan tampil. Nilai lebih besar akan muncul lebih dulu.
- `schedule` opsional. Gunakan format ISO-8601 lengkap dengan timezone offset agar publish window tidak ambigu.

`href` tidak ditulis manual di source file. Route bundle dan campaign dibangkitkan otomatis dari slug oleh:

- `buildBundleHref(slug)`
- `buildCampaignHref(slug)`

Ini sengaja dibuat untuk mengurangi broken link saat tim menambah offer baru.

## Cara Menambah Bundle Baru

1. Tambahkan object baru ke `web/lib/commercial-content/bundles.ts`.
2. Isi field inti seperti `slug`, `title`, `catalogHref`, `bundleItems`, `pricing`, dan `ops`.
3. Pastikan semua `productSlug`, `relatedArticleSlugs`, `relatedSolutionSlugs`, dan `relatedCommoditySlugs` mengarah ke slug yang valid.
4. Jika bundle baru ingin dipakai sebagai referensi konstan lintas file, tambahkan slug-nya juga ke `BUNDLE_REFERENCE_SLUGS` di `web/lib/content-reference-catalog.ts`.
5. Jalankan `npm run validate:commercial-content`.

Catatan:

- Bundle draft tetap boleh disimpan dengan `status: "inactive"`.
- Bundle aktif wajib punya data yang lengkap dan relation yang valid.

## Cara Menambah Campaign Baru

1. Tambahkan object baru ke `web/lib/commercial-content/campaigns.ts`.
2. Isi `bundleSlugs` dan/atau `productSlugs` sebagai jalur masuk utama campaign.
3. Atur `ops.status`, `ops.priority`, dan `ops.schedule` bila campaign musiman perlu auto-on atau auto-expire.
4. Jika campaign baru perlu dipakai sebagai referensi konstan di file lain, tambahkan slug-nya ke `CAMPAIGN_REFERENCE_SLUGS` di `web/lib/content-reference-catalog.ts`.
5. Jalankan `npm run validate:commercial-content`.

Catatan:

- Campaign aktif hanya boleh mereferensikan bundle yang juga aktif.
- Jika campaign aktif memakai schedule, validator akan memastikan jendela publish-nya masih mungkin overlap dengan bundle yang direferensikan.

## Apa Yang Dicek Validator

Saat `npm run build` atau `npm run validate:commercial-content` dijalankan, validator akan menggagalkan build jika menemukan:

- slug atau SKU duplikat
- `href` bundle/campaign yang tidak sinkron dengan slug
- `catalogHref` atau supporting link yang bukan internal path
- referensi artikel, solusi, komoditas, bundle, campaign, atau produk yang tidak valid
- `priority` atau `schedule` yang tidak valid
- item bundle tanpa qty atau nominal yang rusak
- campaign aktif yang menunjuk ke bundle nonaktif atau schedule yang tidak pernah overlap

## Pola Kerja Yang Disarankan

- Untuk campaign musiman, cukup duplikasi object campaign lama yang paling dekat, lalu ubah `slug`, copy, bundle/product relation, dan `ops.schedule`.
- Hindari menambah logika baru di halaman hanya untuk satu campaign. Sebisa mungkin simpan perbedaan di data source.
- Jika sebuah offer belum siap tayang, jadikan `inactive` dulu daripada menghapus definisinya.
