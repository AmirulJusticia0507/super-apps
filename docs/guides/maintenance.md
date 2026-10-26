# Pemeliharaan

Rutinitas menjaga katalog tetap akurat tanpa menyita waktu.

## Ritme

| Frekuensi | Tugas | Perintah |
| --- | --- | --- |
| Setiap kali project berubah metadata | Ubah manifest + validasi | `node scripts/validate-manifest.mjs` |
| Bulanan | Cek path & folder hilang | `node scripts/check-paths.mjs` |
| Kuartalan | Audit stale project | `node scripts/audit-stale.mjs --days 180` |
| Kuartalan | Review status & kategori | manual |
| Tahunan | Review ruang lingkup & eksklusi | manual |

## Prosedur

### 1. Menambah project baru

```bash
# 1. Tambah objek ke apps[] di projects.manifest.json
# 2. Validasi
node scripts/validate-manifest.mjs
# 3. Buat halaman dokumentasi
node scripts/new-project-doc.mjs <id>
# 4. Lengkapi TODO di docs/projects/<id>.md
# 5. Catat di CHANGELOG.md (bagian Unreleased)
```

### 2. Project pindah folder / ganti nama folder

1. Perbarui `apps[].dir`.
2. Perbarui setiap path di `apps[].docs` bila perlu.
3. `node scripts/check-paths.mjs`
4. Jangan ubah `id` — pertahankan tautan dokumentasi.

### 3. Project diarsipkan

1. Set `status: "archived"`.
2. Tambah catatan di `docs/projects/<id>.md` → *Status & Catatan Pemeliharaan*.
3. Statistik dashboard otomatis menyesuaikan.

### 4. Project keluar dari cakupan

1. Pindahkan objek dari `apps[]` ke `exclusions.excluded`.
2. Tambahkan alasan di `exclusions.notes`.
3. Hapus `docs/projects/<id>.md` (atau tandai `archived` bila ingin jejak).
4. Catat di `CHANGELOG.md`.

### 5. Sinkronisasi dokumentasi dari manifest

Setelah mengubah `tagline`, `stack`, `docs`, atau `status`:

```bash
# Lihat dulu apa yang akan timpa (git diff)
node scripts/generate-project-docs.mjs --force
git diff --stat
```

> `--force` menimpa **seluruh** halaman, termasuk tulisan manual. Untuk satu halaman gunakan
> `node scripts/new-project-doc.mjs <id> --force` dan pulihkan bagian manual dari git.

**Lebih aman**: edit manifest → perbarui tabel di halaman terkait secara manual dengan `edit`.

### 6. Menambah kategori

1. Tambah objek ke `categories[]` (`id`, `name`, `icon`, `color`).
2. Pastikan `icon` salah satu dari: `brain`, `scale`, `briefcase`, `landmark`, `gamepad`, `wrench`, `graduation`, `user` — atau tambahkan pemetaan di `catIcon()` pada `app.js`.
3. Urutan di array menentukan urutan grup.
4. Validasi: `node scripts/validate-manifest.mjs`.

## Health Check Cepat

```bash
cd C:/laragon/www/super-apps
node scripts/validate-manifest.mjs --strict
node scripts/check-paths.mjs
node scripts/audit-stale.mjs --days 180
```

Ekspektasi sehat:

- Validator: `✓ Valid` tanpa error (warning docs boleh ada bila memang belum ditulis).
- Check-paths: semua `✓`, 0 hilang.
- Audit-stale: yang `STALE` adalah project yang memang sengaja tidak diaktifkan lagi.

## Tanda Katalog Mulai Tidak Sehat

| Gejala | Tindakan |
| --- | --- |
| > 3 warning `folder tidak ditemukan` | Sinkronkan `dir` dengan workspace |
| > 10 project `archived` | Pertimbangkan memindahkan ke arsip terpisah |
| > 3 warning `docs/<id>.md belum ada` | Jalankan generator |
| `stack` hampir sama di semua project | Data terlalu generik; perjelas |
| Manifest > 60 project | Pertimbangkan memecah per-kategori (lihat roadmap) |

## Backup

Manifest adalah file kecil. Cadangan cukup lewat git:

```bash
git add projects.manifest.json docs/
git commit -m "chore(catalog): rutin audit bulanan"
```
