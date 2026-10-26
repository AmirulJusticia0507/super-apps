---
name: scaffold-readme
description: Prosedur membuat atau memperbaiki README sebuah project di workspace — menelusuri struktur nyata, menyusun README yang akurat (ringkasan, stack, cara menjalankan, konfigurasi, struktur folder), tanpa mengarang perintah.
---

# Skill: Scaffold README

Tujuan: menghasilkan README yang **benar dan bisa langsung dipakai** untuk satu project di `C:/laragon/www`.

Dipakai untuk project yang README-nya kosong (mis. `invitation_wedding_apps`), tidak ada (`readme.md` huruf kecil inkonsisten), atau basi.

## Langkah 1 — Baca Sebelum Menulis

```powershell
$d = "C:\laragon\www\<folder>"

# Struktur top-level
Get-ChildItem $d -Force | Where-Object { $_.Name -notin 'node_modules','.git','vendor','venv','.venv','dist','build' } |
  Select-Object Name, Length | Format-Table -AutoSize

# README lama (bila ada)
Get-ChildItem $d -Filter '*eadme*' | ForEach-Object { Get-Content $_.FullName -TotalCount 80 }

# Marker stack
foreach ($f in 'go.mod','package.json','requirements.txt','pyproject.toml','composer.json','pom.xml','pubspec.yaml','Cargo.toml','project.godot','docker-compose.yml','Dockerfile','Makefile','Taskfile.yml') {
  if (Test-Path "$d\$f") { "HAS $f" }
}

# Contoh env
Get-ChildItem $d -Filter '.env*' -Force | Select-Object -ExpandProperty Name
```

Untuk stack:

```powershell
Get-Content "$d\go.mod" -TotalCount 5                          # Go module
(Get-Content "$d\package.json" -Raw | ConvertFrom-Json) |       # Node
  Select-Object name, scripts, dependencies, devDependencies
Get-Content "$d\requirements.txt" -TotalCount 30                 # Python
```

**Scripts `package.json`** adalah sumber terbaik untuk bagian "Cara menjalankan".

## Langkah 2 — Tulis README

Template (hapus bagian yang tidak berlaku):

```markdown
# <Nama Produk>

> <Satu baris: produk ini apa dan untuk siapa.>

## Fitur

- <fitur yang benar-benar ada di kode>

## Stack

| Lapisan | Teknologi |
| --- | --- |
| Frontend | ... |
| Backend | ... |
| Database | ... |

## Prasyarat

- <runtime> >= <versi>   ← ambil dari `go.mod`, `engines`, `python_requires`, dll.

## Menjalankan Lokal

```bash
cd <folder>
<install>
<setup env>
<run>
```

Akses di `http://localhost:<port>`.

## Konfigurasi

Salin `.env.example` → `.env`, lalu isi:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| ... | ... | ... |

## Struktur Folder

```
<folder>/
├── <isi penting saja, 5–10 baris>
```

## Status

<aktif / dalam pengembangan / arsip> — terakhir diperbarui YYYY-MM, batasan yang diketahui.
```

## Langkah 3 — Aturan Kejujuran

| Jangan | Lakukan |
| --- | --- |
| Menulis "npm run dev" tanpa cek `package.json` | Baca `scripts` dulu |
| Menebak port | Cek kode/config (`PORT`, `vite.config`, `app.listen`) |
| Menulis env var yang tidak dipakai kode | Cari `process.env`/`os.Getenv` |
| Menyalin README project lain | Sesuaikan dengan folder ini |
| Menulis fitur yang belum ada | Sebut sebagai *roadmap* |

## Langkah 4 — Verifikasi

- [ ] Setiap perintah di blok kode ada padanannya di repo (script/config).
- [ ] Port sesuai konfigurasi nyata.
- [ ] Tabel env hanya berisi variabel yang muncul di kode.
- [ ] Nama folder benar.
- [ ] Tidak ada rahasia (token, password, connection string produksi).

## Langkah 5 — Hubungkan ke Super Apps

Setelah README dibuat:

1. Tambahkan `"README.md"` ke `apps[].docs` pada manifest (bila belum).
2. Hapus entri terkait dari `apps[].gaps`.
3. Validasi:

```powershell
cd C:\laragon\www\super-apps
node scripts/validate-manifest.mjs
```

## Di Mana Meletakkan README

- Ikuti konvensi project itu sendiri (banyak project Anda memakai `readme.md` huruf kecil).
- Untuk project baru: `README.md` (huruf besar) — paling umum di GitHub.
- Perbarui field `docs` di manifest sesuai nama file yang dipakai.
