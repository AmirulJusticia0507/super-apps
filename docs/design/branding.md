# Branding Super Apps

## Nama & Posisi

- **Nama**: Super Apps
- **Subjudul**: *personal project hub*
- **Pemilik**: Amirul Putra Justicia
- **Posisi**: titik masuk tunggal ke seluruh karya personal — laboratorium, portofolio, dan arsip.

Super Apps **bukan** produk komersial. Ia adalah *cockpit* pribadi.

## Tagline

> Satu pintu untuk semua yang saya bangun.

Alternatif:
- "42 project, satu dashboard."
- "Hub orkestrasi project personal."

## Logo

Logo saat ini berupa **monogram emoji 🚀 di dalam kotak gradien**:

```css
.logo {
  width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6 55%, #ec4899);
  font-size: 22px;
}
```

Makna: peluncuran (rocket) + spektrum (gradien indigo → violet → pink) yang merepresentasikan keragaman kategori project.

### Rencana Logo SVG

Bila dibuat vector:

- Bentuk: kotak membulat (squircle) 44×44, radius 12.
- Gradien: `#6366f1 → #8b5cf6 (55%) → #ec4899` pada 135°.
- Glif: roket sederhana bersudut 45°, satu warna putih (`#ffffff`), stroke 2.
- Versi monokrom: latar `--text`, glif `--bg`.
- Ukuran minimum: 24px. Di bawah itu pakai versi tanpa glif.

## Palet Identitas

| Peran | Warna |
| --- | --- |
| Primary | Indigo `#6366F1` |
| Secondary | Violet `#8B5CF6` |
| Accent | Pink `#EC4899` |
| Netral gelap | `#0b0f17` |
| Netral terang | `#f6f8fc` |

Gradien identitas hanya untuk logo dan aksen kecil — **jangan** dipakai sebagai latar halaman (melelahkan mata untuk konten data).

## Suara & Nada

| Konteks | Nada |
| --- | --- |
| UI | Ringkas, bahasa Indonesia, tanpa basa-basi |
| Dokumentasi | Teknis, langsung, contoh nyata |
| Changelog | Faktual, satu baris per perubahan |

Contoh baik: "Tidak ada project yang cocok dengan pencarian."
Contoh buruk: "Ups! Sepertinya tidak ada hasil nih 🙈"

## Pemakaian Nama

- Selalu **"Super Apps"** (dua kata, huruf kapital di awal kata), bukan `SuperApps`, `super apps`, atau `SUPER APPS`.
- Nama file/folder: `super-apps`.
- Judul halaman: `Super Apps — Amirul Putra Justicia`.

## Aset

| Aset | Lokasi | Status |
| --- | --- | --- |
| Favicon | inline SVG data URI di `index.html` | ✅ ada |
| Logo | CSS `.logo` | ✅ ada (emoji) |
| Logo SVG vector | — | ⏳ belum |
| OG image | — | ⏳ belum (dibutuhkan bila dipublikasikan) |

## Checklist Publikasi

- [ ] Buat OG image 1200×630 dengan logo + tagline.
- [ ] Tambah `<meta property="og:*">` di `index.html`.
- [ ] Siapkan versi monokrom logo.
- [ ] Tentukan domain publik (mis. `super.amirul.dev`).
