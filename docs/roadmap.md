# Roadmap Super Apps

## Filosofi

Hub tumbuh **hanya saat ada kebutuhan nyata**. Fitur yang tidak dipakai akan menjadi utang perawatan. Setiap butir harus menjawab: "masalah apa yang sedang saya alami?"

## v1.0 — Fondasi ✅ (selesai)

- [x] Manifest 42 project, 8 kategori, dengan pengecualian terdokumentasi
- [x] Dashboard zero-dependency: pencarian, filter kategori, tema, salin path, buka repo
- [x] Skrip: validasi, cek path, audit stale, generator dokumentasi
- [x] 42 halaman dokumentasi project
- [x] Dokumentasi arsitektur, ADR, design system, branding, panduan
- [x] Agent & skill pendukung
- [x] CI validasi manifest

**Kriteria rilis**: `validate-manifest --strict` lulus, dashboard menampilkan semua project tanpa error console.

## v1.1 — Depth 📋

- [ ] Modal detail project di dashboard (render `docs/projects/<id>.md`, minimal tabel metadata)
- [ ] Deep link `#/project/<id>`
- [ ] Sort: nama / status / abjad kategori
- [ ] Filter status (`active` / `maintenance` / `archived`)
- [ ] Indikator "docs belum lengkap" pada kartu (`gaps`)

**Alasan**: dengan 42 project, membuka repo satu per satu untuk membaca konteks mulai lambat.

## v1.2 — Automation 📋

- [ ] `scripts/sync-metadata.mjs` — ambil nama branch default, last commit, bahasa dominan dari git lokal, lalu isi manifest secara otomatis (tidak menimpa field manual)
- [ ] `scripts/health-report.mjs` — gabungan: validasi + path + stale + gaps → satu laporan Markdown
- [ ] Nightly CI: komentar/label issue bila path hilang atau manifest invalid

**Alasan**: metadata yang bisa ditarik dari git tidak perlu diisi manual dan mudah basi.

## v1.3 — Launcher 📋

- [ ] CLI `super` (Node, zero-dep): `super list`, `super open <id>`, `super run <id>`
- [ ] Registry perintah start per project (dari field opsional `run` di manifest)
- [ ] Opsional: `docker compose up -d` untuk project yang punya compose file

**Alasan**: langkah paling sering dilakukan adalah "pindah folder lalu jalankan". Ini menghapus satu lapis gesekan.

**Risiko**: menjalankan server dari hub membuat hub bergantung pada runtime project (bertentangan dengan prinsip non-invasif). Karena itu dibuat **sisi CLI terpisah**, bukan bagian shell statis.

## v2.0 — Publik 🌱

- [ ] Deploy dashboard ke domain publik sebagai portofolio
- [ ] OG image + meta sosial
- [ ] Halaman case study untuk 5–8 project unggulan
- [ ] Mode "sorot" — sembunyikan project privat/arsip dari publik

**Alasan**: hub ini sudah mendeskripsikan pengalaman teknis bertahun-tahun; layak jadi portofolio publik.

**Prasyarat**: audit ulang ruang lingkup (pastikan tidak ada nama internal instansi yang ikut terpublikasi).

## Di Luar Cakupan (Non-Goals)

| Ide | Mengapa ditolak |
| --- | --- |
| Monorepo semua project | Masing-masing punya stack, deploy, dan umur berbeda |
| Hub sebagai API gateway | Project sudah punya API sendiri |
| Database untuk katalog | Data statis; JSON cukup |
| Autentikasi di hub | Tidak ada data privat yang disajikan |
| Menyatukan semua README jadi satu | Dokumentasi per project harus tetap di repo masing-masing |

## Backlog Ide (belum dijadwalkan)

- Timeline project (kapan tiap project dimulai/selesai) sebagai visualisasi riwayat belajar.
- Heatmap commit agregat dari seluruh repo.
- Statistik bahasa pemrograman agregat (seperti profil GitHub).
- Perbandingan versi produk: `paymentreceipt` → `v2` → `quality`.
- Halaman "cluster teknologi": Go, Python, GIS, LLM.

## Kriteria Naik Versi

| Dari | Ke | Syarat |
| --- | --- | --- |
| 1.0 | 1.1 | Semua item v1.1 selesai & dipakai ≥ 1 minggu |
| 1.1 | 1.2 | Perubahan metadata manual terasa mengganggu |
| 1.2 | 1.3 | Pindah-folder-jalankan terjadi > 3×/hari |
| 1.x | 2.0 | Portofolio publik ingin dirilis |

Versi minor per kuartal yang berisi perubahan bermakna; patch untuk perbaikan data.
