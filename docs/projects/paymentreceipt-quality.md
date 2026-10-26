# Payment Receipt (Quality Branch)

> Working copy QC dari Payment Receipt v2 (branch `agent/quality-guardrails`)

| | |
| --- | --- |
| **ID** | `paymentreceipt-quality` |
| **Folder** | `C:/laragon/www/paymentreceipt-quality` |
| **Kategori** | Business & Operations (`business`) |
| **Status** | `maintenance` |
| **Entry point** | `backend/cmd/` |
| **Repository** | <https://github.com/AmirulJusticia0507/paymentreceipt-v2.git> |
| **Stack** | Go, PostgreSQL, Vue 3, Tailwind CSS, Docker |
| **Tags** | `finance`, `qa`, `receipt`, `quality-guardrails` |

## Ringkasan

Ini **bukan produk terpisah** — ia adalah *working copy* dari **Payment Receipt v2** yang
dipakai untuk kerja peningkatan kualitas dan *guardrails* CI pada branch
`agent/quality-guardrails`.

Bukti:

- Remote identik dengan `paymentreceipt-v2`.
- README hampir identik (hanya berbeda pada bagian yang terkait perubahan QC).
- Ukuran proyek nyaris sama (≈10.6 ribu file, selisih karena artefak build/cache).
- Riwayat commit di branch QC: `ci(backend): measure test coverage…`,
  `Merge branch 'main' into agent/quality-guardrails`, `docs(ci): record why the npm audit step cannot be a gate`.

## Mengapa Dicatat di Katalog

Agar tidak tertukar saat bekerja. Keduanya hampir identik di layar; membuka folder yang salah
dapat membuat perubahan hilang atau konflik saat merge.

| Ingin… | Folder |
| --- | --- |
| Fitur baru / kerja produk | `paymentreceipt-v2` |
| Peningkatan QC, coverage, CI gate | `paymentreceipt-quality` |

## Isi Perubahan (dari commit)

- Pengukuran **coverage** backend (ambang batas diputuskan belakangan).
- Penelitian kelayakan **`npm audit` sebagai CI gate** — didokumentasikan mengapa belum bisa dijadikan gate.
- Perbaikan dokumentasi CI.

## Arsitektur

Sama dengan v2 (`cmd/`, `internal/`, `db/`, `integration/`, `frontend/`). Tidak ada perubahan arsitektur.

## Menjalankan Lokal

Sama dengan v2:

```bash
cd C:/laragon/www/paymentreceipt-quality
docker compose up
make help
```

## Status & Catatan Pemeliharaan

- **Terakhir diaudit**: 2026-10-26
- **Status**: `maintenance` — hanya untuk kerja QC
- **Risiko**: dua working copy dari repo yang sama → **rawan divergensi**. Setelah selesai, merge
  branch QC ke `main`, lalu hapus/arsipkan folder ini
- **Rencana**: selesaikan guardrails, merge, kemudian jadikan `archived`

## Riwayat

| Tanggal | Perubahan |
| --- | --- |
| 2026-10-26 | Halaman dibuat; status ditetapkan `maintenance` berdasarkan bukti remote & branch. |
