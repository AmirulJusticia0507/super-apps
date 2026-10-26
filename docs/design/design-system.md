# Design System — Super Apps

Sistem desain ringan untuk shell Super Apps dan sebagai **rujukan bersama** bila project lain ingin menyelaraskan tampilan.

## Prinsip Desain

1. **Data di atas dekorasi** — katalog harus terbaca dalam < 3 detik.
2. **Dua tema setara** — gelap dan terang sama-sama warga kelas satu (bukan afterthought).
3. **Warna = makna** — warna hanya menandai kategori/status, bukan hiasan.
4. **Diam saat diam** — animasi hanya pada interaksi (hover, toggle), maksimal 220 ms.
5. **Bisa dipakai tanpa mouse** — fokus terlihat, `aria-*` benar, shortcut `/`.

## Token

Semua token berupa CSS custom property di `:root` (dark default) dan `[data-theme="light"]`.

### Warna

| Token | Dark | Light | Fungsi |
| --- | --- | --- | --- |
| `--bg` | `#0b0f17` | `#f6f8fc` | Latar halaman |
| `--surface` | `#121826` | `#ffffff` | Kartu, input |
| `--surface-2` | `#1a2233` | `#eef2f9` | Tag, hover, toast |
| `--border` | `#243044` | `#dce4f0` | Garis pemisah |
| `--text` | `#e8eef7` | `#101828` | Teks utama |
| `--muted` | `#8fa0b8` | `#5a6b85` | Teks sekunder |
| `--accent` | `#6366f1` | `#6366f1` | Aksen utama (indigo) |

Kontras teks utama terhadap latar: ≥ 12:1 (dark), ≥ 15:1 (light). Teks `--muted` tetap ≥ 4.5:1 pada permukaan kartu.

### Warna Kategori

| Kategori | Hex | Dipakai untuk |
| --- | --- | --- |
| AI & Machine Learning | `#8B5CF6` | ungu |
| Legal Tech | `#0EA5E9` | biru langit |
| Business & Operations | `#F59E0B` | amber |
| Civic & Public Sector | `#10B981` | emerald |
| Games & Interactive | `#EC4899` | pink |
| Tools & Utilities | `#6366F1` | indigo |
| Education & Experiments | `#14B8A6` | teal |
| Portfolio & Personal | `#F97316` | oranye |

Warna kategori **tidak** boleh dipakai untuk makna lain (mis. error). Warna itu selalu datang dari `--card-color` per kartu.

### Warna Status

| Status | Teks (dark) | Latar |
| --- | --- | --- |
| `active` | `#34d399` | `rgba(16,185,129,.15)` |
| `maintenance` | `#fbbf24` | `rgba(245,158,11,.15)` |
| `archived` | `#94a3b8` | `rgba(100,116,139,.2)` |

Status selalu disertai **teks label**, bukan hanya warna (aksesibilitas buta warna).

### Tipografi

| Peran | Ukuran | Berat | Keterangan |
| --- | --- | --- | --- |
| Judul halaman (h1) | 1.35rem | 700 | `letter-spacing: -.02em` |
| Subjudul grup (h2) | .72rem | 600 | UPPERCASE, `letter-spacing: .1em`, muted |
| Nama kartu | .98rem | 650 | |
| Tagline | .8rem | 400 | `--muted`, line-height 1.45 |
| Tag / badge | .68rem | 400/700 | |
| Path | .68rem | 400 | monospace |

Font: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto` — tanpa webfont, nol request jaringan.

### Spacing

Skala 4px: `4, 8, 10, 12, 14, 16, 18, 22, 24, 28, 64`. Tidak memakai skala 8px penuh agar densitas kartu sesuai.

### Radius & Elevasi

| Token | Nilai | Dipakai |
| --- | --- | --- |
| `--radius` | `14px` | Kartu |
| radius kecil | `10px` | Input, tombol ikon |
| radius mikro | `6–9px` | Tag, badge, ikon kartu |
| `--shadow` | dark: `0 10px 30px rgba(0,0,0,.35)` · light: `0 8px 24px rgba(16,24,40,.08)` | Hover kartu |

### Gerak

| Interaksi | Durasi | Easing |
| --- | --- | --- |
| Hover kartu (lift 2px) | 150 ms | default |
| Toggle tema | instan (tanpa transisi global) | — |
| Toast | 220 ms | default |

Hormati `prefers-reduced-motion` bila menambah animasi baru.

## Komponen

| Komponen | Aturan |
| --- | --- |
| **Card** | Garis atas 3px berwarna kategori; hover: `translateY(-2px)` + border berwarna kategori + shadow. |
| **Chip filter** | Pill; `aria-pressed="true"` = latar accent, teks putih. Selalu menampilkan dot warna kategori. |
| **Badge status** | Uppercase .64rem, latar transparan, teks berwarna status. |
| **Tag stack** | Latar `--surface-2`, tanpa border, maksimal 5 per kartu. |
| **Tombol** | `Path` (sekunder) dan `Repo ↗` (aksen); fokus ring 2px accent. |
| **Input pencarian** | Ikon kiri, `:focus` ring 2px accent dengan offset 1px. |
| **Toast** | Muncul dari bawah tengah, auto-hide 2.2 s. |

## Grid & Responsif

- Grid kartu: `repeat(auto-fill, minmax(290px, 1fr))`, gap 14px.
- Kontainer maksimum 1280px, padding horizontal 24px.
- < 560px: kolom pencarian mengambil satu baris penuh.

## Aksesibilitas

- Semua kontrol interaktif adalah `<button>`/`<a>` asli.
- Ikon dekoratif (`🚀`, emoji) tidak menyampaikan informasi unik; nama project selalu berupa teks.
- Input punya `aria-label`; chip punya `aria-pressed`.
- Shortcut `/` memfokuskan pencarian (tidak menimpa pengetikan di input).
- Fokus keyboard selalu terlihat (outline, bukan `outline: none`).

## Checklist Penambahan Komponen

- [ ] Pakai token yang ada; jangan hardcode warna baru.
- [ ] Uji di dua tema.
- [ ] Periksa kontras ≥ 4.5:1 untuk teks normal.
- [ ] Pastikan bisa dioperasikan keyboard.
- [ ] Tulis dokumentasinya di halaman ini.
