# Spesifikasi Dashboard

Implementasi: [`index.html`](../../index.html) + [`app.js`](../../app.js)

## Tujuan

Pengguna masuk ke satu halaman dan dalam < 10 detik bisa:

1. Melihat **berapa** project yang dimiliki (per kategori & status).
2. **Menemukan** project tertentu lewat pencarian atau filter.
3. **Membuka** repo atau menyalin path lokal untuk mulai bekerja.

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 🚀 Super Apps            [ 🔍 cari… ]           [ ☀️/🌙 ]    │  ← header.topbar
│ Amirul Putra Justicia · personal project hub                 │
│                                                              │
│  42        8         61        39        2                   │  ← header.stats
│  project   kategori  teknologi aktif     arsip               │
│                                                              │
│ ( Semua ) ( AI ) ( Legal ) ( Business ) ( Civic ) ( … )      │  ← header.chips
├──────────────────────────────────────────────────────────────┤
│ AI & MACHINE LEARNING · 8                                    │  ← h2.group-title
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│ │ Kartu    │ │ Kartu    │ │ Kartu    │                       │  ← .grid
│ └──────────┘ └──────────┘ └──────────┘                       │
│                                                              │
│ LEGAL TECH · 4                                               │
│ ┌──────────┐ …                                               │
├──────────────────────────────────────────────────────────────┤
│ 42 dari 42 project ditampilkan · manifest · v1.0.0           │  ← footer
└──────────────────────────────────────────────────────────────┘
```

## Anatomi Kartu

```
┌──────────────────────────────────────┐  ← garis atas 3px = warna kategori
│ ┌──┐  Al-Hikmah AI          [ACTIVE] │  ← ikon kategori · nama · badge
│ │🧠│  Platform Qur'an & Hadits …     │  ← tagline (muted, 2 baris maks)
│ └──┘                                 │
│ [Next.js] [Python] [LLM] [Postgres]  │  ← tag stack (maks 5)
│ ──────────────────────────────────── │  ← border dashed
│ ../AI_LLM_Qur'an_Hadits  [Repo ↗][Path] │
└──────────────────────────────────────┘
```

## Perilaku

| Aksi | Perilaku |
| --- | --- |
| Mengetik di pencarian | Filter instan; multi-kata = AND (`docker backend` cocok bila keduanya ada) |
| Pencarian tanpa hasil | Empty state tampil, grid kosong |
| Klik chip | Filter satu kategori; chip aktif `aria-pressed="true"` |
| Klik chip aktif lagi | Tetap pada kategori tersebut (pilih **Semua** untuk reset) |
| Klik `Path` | Salin `workspace/dir` ke clipboard, muncul toast |
| Klik `Repo ↗` | Buka tab baru |
| Toggle tema | Ganti `data-theme`, simpan di `localStorage` |
| `/` | Fokus ke kolom pencarian (diabaikan bila sudah fokus di input) |
| Klik nama project di sidebar | Memilih project dan memperbarui ringkasan progress serta kerentanan |

### Urutan Render

1. Grup mengikuti urutan `categories[]` di manifest.
2. Kartu di dalam grup diurutkan alfabetis berdasarkan `name`.
3. Grup kosong tidak dirender.

### Field Pencarian

Yang dicari: `name`, `tagline`, `dir`, `id`, `stack[]`, `tags[]`.

## State

| State | Default | Persistensi |
| --- | --- | --- |
| `query` | `""` | — (reset saat reload) |
| `category` | `all` | — |
| `theme` | `prefers-color-scheme` | `localStorage["superapps-theme"]` |
| `selectedId` | project pertama pada manifest | — |

## Sidebar project

Sidebar berada di sisi kiri pada layar desktop dan berpindah ke atas katalog pada layar sempit. Daftar project memakai tombol asli untuk memilih project. Ringkasan project terpilih berisi:

- **Progress project**: progress bar skala 0–100 dari `apps[].progress`. Bila field tidak tersedia, nilainya ditampilkan sebagai **Belum dinilai**.
- **Kerentanan**: status dan jumlah temuan terbuka dari `apps[].security`. Bila belum ada data audit, tampil **Belum diaudit** tanpa mengklaim project aman.

## Error & Empty State

| Kasus | Tampilan |
| --- | --- |
| Manifest gagal dimuat | Pesan error + saran menjalankan HTTP server (`npx serve .`) |
| Pencarian kosong | "Tidak ada project yang cocok…" |
| JSON invalid | Fetch tetap sukses, JSON parse gagal → pesan error |

## Kriteria Penerimaan

- [ ] 42 kartu tampil, 8 grup, tanpa error console.
- [ ] Pencarian `docker` menyempitkan hasil; query sampah menampilkan empty state.
- [ ] Filter `games` menampilkan 7 kartu.
- [ ] Toggle tema bertahan setelah reload.
- [ ] Layout tidak pecah pada 360px, 768px, 1440px.
- [ ] Keyboard: Tab mencapai semua kontrol, `/` fokus ke pencarian.

## Pengembangan Lanjutan (belum diimplementasi)

- Modal detail project (menampilkan `docs/projects/<id>.md`).
- Sort (nama / status / terbaru).
- Deep link `#/project/<id>`.
- Filter status.

Semua di atas tetap harus membaca manifest yang sama.
