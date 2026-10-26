# Getting Started

Panduan menjalankan dan memakai Super Apps.

## Prasyarat

| Kebutuhan | Versi | Untuk apa |
| --- | --- | --- |
| Browser modern | Chrome/Edge/Firefox terbaru | Dashboard |
| Node.js | ≥ 18 | Skrip `scripts/*.mjs` (ESM) |
| Python **atau** Node `serve` | — | HTTP server lokal (opsional) |

Tidak ada `npm install`. Tidak ada build.

## Menjalankan Dashboard

### Opsi 1 — Laragon (paling praktis)

1. Pastikan Laragon berjalan (`Start All`).
2. Buka `http://localhost/super-apps/`.

> Folder `C:\laragon\www\super-apps` otomatis tersaji oleh Apache/Nginx Laragon.

### Opsi 2 — npx serve

```bash
cd C:\laragon\www\super-apps
npx serve .
```

### Opsi 3 — Python

```bash
cd C:\laragon\www\super-apps
python -m http.server 8811
```

Buka `http://localhost:8811/`.

> **Jangan** membuka `index.html` lewat `file://` — `fetch()` manifest akan diblokir CORS, dan dashboard menampilkan pesan error.

## Memakai Dashboard

1. **Cari** — tekan `/` lalu ketik (mis. `docker`, `lex`, `go`).
2. **Filter** — klik chip kategori (mis. *Games & Interactive*).
3. **Reset** — klik chip **Semua**.
4. **Path** — klik tombol *Path* pada kartu, lalu tempel di terminal:
   ```bash
   cd C:\laragon\www\lex-integrity
   ```
5. **Repo** — klik *Repo ↗* untuk membuka remote.
6. **Tema** — klik ☀️/🌙.

## Menjalankan Skrip

```bash
cd C:\laragon\www\super-apps

node scripts/validate-manifest.mjs        # validasi katalog
node scripts/check-paths.mjs              # cek folder project
node scripts/audit-stale.mjs --days 180   # project yang lama tidak disentuh
node scripts/generate-project-docs.mjs    # (re)generate docs/projects/*.md
node scripts/new-project-doc.mjs <id>     # skeleton satu halaman project
```

Semua skrip menerima `--json` (kecuali generator) untuk output terstruktur.

## Struktur Kerja yang Disarankan

```
1. Buka dashboard            → orientasi
2. Klik Path                 → pindah ke folder project
3. Kerjakan di repo project  → hub tidak disentuh
4. Update manifest/docs      → bila metadata project berubah
```

Hub **tidak** menjadi tempat mengedit kode project. Ia hanya membaca metadata.

## Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| "Gagal memuat projects.manifest.json" | Dibuka via `file://` | Jalankan HTTP server |
| Halaman kosong tanpa pesan | Manifest JSON rusak | `node scripts/validate-manifest.mjs` |
| Kartu tidak muncul setelah edit | Cache browser | Hard reload (Ctrl+Shift+R) |
| Chip tidak menyaring | `category` di app tidak ada di `categories[]` | Jalankan validator |
| Folder project "tidak ditemukan" | `dir` beda dengan nama folder | `node scripts/check-paths.mjs` |

## Langkah Berikutnya

- Menambah project: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Memahami skema: [`../architecture/manifest-schema.md`](../architecture/manifest-schema.md)
- Rutinitas berkala: [`maintenance.md`](./maintenance.md)
