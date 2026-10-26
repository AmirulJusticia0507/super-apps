# ADR-0002 — Dashboard static tanpa dependency

- **Status**: Diterima
- **Tanggal**: 2026-10-26
- **Konteks**: Layer presentasi Super Apps

## Konteks

Dashboard perlu menampilkan katalog, pencarian, filter, dan tema. Kandidat: Next.js/React, Vue + Vite, atau HTML/CSS/JS murni.

## Keputusan

Shell dashboard ditulis sebagai **HTML + CSS + JS murni** (`index.html`, `app.js`) tanpa framework, tanpa bundler, tanpa `node_modules`.

## Alasan

1. **Tahan lama** — tidak akan rusak karena framework major version atau dependency transitif bermasalah.
2. **Nol gesekan** — dibuka lewat Laragon/`python -m http.server` saja; tidak perlu `npm install`.
3. **Fokus data** — kebutuhan UI adalah render daftar statis + filter; DOM langsung cukup.
4. **Ukuran kecil** — satu file JS ±200 baris, mudah diaudit total.

## Konsekuensi

**Positif**
- Tidak ada supply-chain risk dari npm untuk hub.
- Bisa di-host di mana saja, termasuk GitHub Pages/static hosting.

**Negatif**
- Tidak ada SSR (tidak dibutuhkan — data publik, statis).
- Tidak ada ekosistem komponen; jika UI tumbuh kompleks (modal, routing), biaya menulis manual naik.
- `fetch()` butuh origin HTTP, jadi `file://` tidak jalan → didokumentasikan di README.

## Titik Eskalasi

Beralih ke framework hanya jika salah satu terjadi:

- >5 interaksi stateful yang saling terkait (mis. detail view + editor manifest di browser).
- Butuh routing per project.
- Butuh SSR untuk SEO dashboard publik → lebih mungkin pakai static generator (Astro) daripada SPA.

Sampai itu terjadi, shell tetap plain.

## Alternatif yang Ditolak

| Alternatif | Alasan |
| --- | --- |
| Next.js | Overkill untuk 1 halaman statis; menambah build + deploy surface. |
| Vue + Vite | Build step dan lockfile yang perlu dirawat. |
| Astro | Menarik untuk SEO, tetapi menambah toolchain; ditunda sampai dashboard publik. |
| Web components | Tidak menyederhanakan apa pun untuk skala ini. |
