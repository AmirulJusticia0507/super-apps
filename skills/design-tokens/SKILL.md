---
name: design-tokens
description: Prosedur mengubah atau menambah token desain dan komponen pada dashboard Super Apps — warna, tipografi, spacing, komponen kartu/chip/badge — dengan menjaga kontras, dua tema, dan konsistensi dengan design system.
---

# Skill: Design Tokens

Tujuan: mengubah tampilan Super Apps **tanpa merusak** konsistensi, kontras, atau dukungan tema.

## Peta File

| File | Isi |
| --- | --- |
| `index.html` `<style>` | Definisi token (`:root`, `[data-theme="light"]`) dan seluruh CSS komponen |
| `app.js` | Markup kartu (`card()`), ikon kategori (`catIcon()`), render chip |
| `docs/design/design-system.md` | Dokumentasi token & komponen (wajib ikut diperbarui) |

## Token yang Ada

```css
:root {                     /* dark — default */
  --bg; --surface; --surface-2; --border;
  --text; --muted; --accent;
  --radius; --font; --shadow;
}
[data-theme="light"] { /* override token yang sama */ }
```

Warna kategori **tidak** di CSS — berasal dari `categories[].color` di manifest dan disuntik lewat `style="--card-color: …"` per kartu.

## Aturan

1. **Jangan hardcode warna** di komponen. Pakai `var(--…)` atau `var(--card-color)`.
2. **Selalu definisikan di kedua tema** bila token baru. Ubah `:root` **dan** `[data-theme="light"]`.
3. **Pertahankan kontras**: teks normal ≥ 4.5:1, teks besar ≥ 3:1, terhadap permukaan tempatnya.
4. **Warna bukan satu-satunya penanda** — badge status selalu punya teks.
5. **Gerak minimal** — ≤ 220 ms, hanya untuk interaksi.
6. **Tanpa webfont / aset eksternal** — tetap zero-dependency.

## Resep Umum

### Mengubah warna aksen

```css
:root { --accent: #0ea5e9; }
```
Cek juga: `input:focus` ring, `.chip[aria-pressed="true"]`, garis atas kartu default.

### Menambah warna kategori

Ubah manifest, bukan CSS:

```json
{ "id": "data", "name": "Data & Analytics", "icon": "chart", "color": "#EF4444" }
```

Bila `icon` baru, tambahkan pemetaan emoji di `catIcon()` pada `app.js`, lalu dokumentasikan di design system.

### Mengubah kerapatan kartu

```css
.grid { grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
```
Saat memperkecil `minmax`, uji di 360px agar nama project panjang tidak terpotong.

### Menambah komponen baru

1. Tambah CSS berbasis token.
2. Tambah di `docs/design/design-system.md` (tabel komponen).
3. Uji kedua tema.
4. Uji keyboard & kontras.

## Verifikasi

```powershell
cd C:\laragon\www\super-apps
python -m http.server 8811
```

Buka `http://localhost:8811/`:

- [ ] 42 kartu tampil, 8 grup
- [ ] Toggle tema mengubah seluruh permukaan (tidak ada area "nyangkut" warna tema lain)
- [ ] Hover kartu: terangkat, border berubah warna kategori
- [ ] Chip aktif jelas berbeda dari yang tidak aktif
- [ ] Badge status tetap terbaca di kedua tema
- [ ] Console bersih

Screenshot kedua tema untuk perbandingan bila perubahan besar.

## Checklist Dokumentasi

- [ ] Token baru tercatat di `docs/design/design-system.md`
- [ ] Komponen baru tercatat di tabel komponen
- [ ] Bila mengubah struktur kartu, perbarui `docs/design/dashboard-spec.md`
- [ ] Catat di `CHANGELOG.md` (`### Changed`)

## Anti-Pola

| Jangan | Karena |
| --- | --- |
| Hex langsung di komponen | Tema terang/gelap rusak |
| Transisi global `* { transition: all }` | Toggle tema jadi lambat & berat |
| Gradien sebagai latar halaman | Mengganggu keterbacaan data |
| Emoji sebagai satu-satunya penanda status | Tidak aksesibel |
| Menambah font Google | Melanggar zero-dependency & privasi |
