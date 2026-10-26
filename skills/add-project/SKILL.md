---
name: add-project
description: Prosedur menambahkan project baru ke katalog Super Apps — verifikasi kepemilikan, kumpulkan metadata nyata, tulis entri manifest, buat halaman dokumentasi, dan validasi.
---

# Skill: Add Project

Tujuan: menambahkan satu project ke Super Apps **tanpa mengarang data** dan tanpa melanggar ruang lingkup.

**Prasyarat**: folder project sudah ada di `C:/laragon/www`.

## Langkah 1 — Verifikasi Kepemilikan

Jangan lewati. Super Apps hanya memuat project milik sendiri.

```powershell
$d = "C:\laragon\www\<folder>"

# Ada git?
Test-Path "$d\.git"

# Remote
git -C $d remote get-url origin

# Author dominan
git -C $d log --format='%an <%ae>' -n 400 | Sort-Object -Unique
```

**Lolos** bila salah satu:

| Kriteria | Tanda |
| --- | --- |
| Repo pribadi | remote berisi `github.com/AmirulJusticia0507/` |
| Author sendiri | muncul `amirulputra0507`, `AmirulJusticia0507`, `amirulpj`, `amirul.justicia0507` |
| Lokal karya sendiri | tanpa git, tapi jelas terkait project sendiri |

**Gagal** → berhenti, lalu tambahkan ke `exclusions.excluded` + `exclusions.notes` di manifest (dengan alasan). Lihat `docs/guides/scope-and-exclusions.md`.

## Langkah 2 — Kumpulkan Metadata

```powershell
# Daftar file top-level (untuk entry point & stack)
Get-ChildItem $d -Force | Select-Object -First 30 -ExpandProperty Name

# README & judulnya
Get-ChildItem $d -Filter '*eadme*' | ForEach-Object { Get-Content $_.FullName -TotalCount 10 }

# File dokumentasi lain (untuk field docs)
Get-ChildItem $d -Filter '*.md' -File | Select-Object -ExpandProperty Name

# Stack signal
Test-Path "$d/go.mod", "$d/package.json", "$d/requirements.txt", "$d/composer.json", "$d\pom.xml", "$d\pubspec.yaml", "$d\project.godot"
```

Isi field dari bukti:

| Field | Sumber |
| --- | --- |
| `dir` | nama folder **persis** |
| `name` | judul H1 README, atau nama produk dikenal |
| `tagline` | ringkasan 1 baris (bukan copy-paste paragraf) |
| `stack` | dari manifest file dependensi — bukan tebakan |
| `entry` | file/folder utama (`main.go`, `server.js`, `index.php`, `manage.py`, `apps/`) |
| `docs` | file `.md` di top-level yang benar-benar ada |
| `repo` | remote URL, atau `""` bila lokal |
| `category` | pilih dari `categories[]` |
| `status` | `active` default; `archived` bila lama tak disentuh |

Lihat `docs/architecture/manifest-schema.md` untuk enum dan aturan.

## Langkah 3 — Tulis Entri

Sisipkan ke `apps[]` pada manifest, urutan field konvensi:

```json
{
  "id": "<kebab-case>",
  "dir": "<folder-persis>",
  "name": "<Nama>",
  "tagline": "<satu baris>",
  "category": "<id-kategori>",
  "status": "active",
  "repo": "<url atau string kosong>",
  "stack": ["<Teknologi>"],
  "entry": "<entry>",
  "docs": ["README.md"],
  "tags": ["<kata-kunci>"]
}
```

Aturan `id`:
- kebab-case, unik, stabil.
- Bila `dir` mengandung spasi/tanda baca (`AI_LLM_Qur'an_Hadits`), gunakan id bersih (`al-hikmah-ai`).

## Langkah 4 — Validasi

```powershell
cd C:\laragon\www\super-apps
node scripts/validate-manifest.mjs
```

Perbaiki semua **error**. Warning `docs/<id>.md belum ada` wajar pada titik ini.

## Langkah 5 — Dokumentasi

```powershell
node scripts/new-project-doc.mjs <id>
```

Lengkapi bagian `TODO` pada `docs/projects/<id>.md` memakai bukti dari langkah 2 (jangan mengarang arsitektur).

## Langkah 6 — Catat & Verifikasi

1. Tambah baris di `CHANGELOG.md` → `### Added`.
2. Buka dashboard (`http://localhost:8811/`), pastikan kartu muncul dengan kategori benar.
3. Cek `docs/projects/<id>.md` ada dan terhubung.

## Checklist Akhir

- [ ] Kepemilikan terverifikasi dari data git
- [ ] `dir` cocok dengan folder nyata (`check-paths.mjs` ✓)
- [ ] `id` unik & kebab-case
- [ ] `category` ada di `categories[]`
- [ ] `docs` hanya berisi file yang benar-benar ada
- [ ] `validate-manifest.mjs` tanpa error
- [ ] Halaman docs dibuat
- [ ] CHANGELOG diperbarui
- [ ] Kartu tampil di dashboard
