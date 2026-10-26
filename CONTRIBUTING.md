# Contributing

Terima kasih! Repositori ini adalah hub katalog pribadi, tetapi alur kontribusinya tetap dijaga rapi agar katalog tidak rusak.

## Prinsip

1. **Satu sumber kebenaran** — semua data project berada di `projects.manifest.json`.
2. **Terverifikasi** — perubahan harus lulus validator.
3. **Tidak invasif** — jangan menyentuh kode project di luar hub.

## Setup

```powershell
cd C:\laragon\www\super-apps
# Tidak ada npm install. Cukup Node >= 18 untuk skrip.
node scripts/validate-manifest.mjs
```

Menjalankan dashboard:

```powershell
python -m http.server 8811
# atau
npx serve .
```

## Jenis Kontribusi

| Jenis | Panduan |
| --- | --- |
| Menambah project | [`skills/add-project/SKILL.md`](./skills/add-project/SKILL.md) |
| Memperbaiki data | Ubah entri terkait + validasi |
| Dokumentasi | [`docs/guides/project-doc-template.md`](./docs/guides/project-doc-template.md) |
| Tampilan dashboard | [`skills/design-tokens/SKILL.md`](./skills/design-tokens/SKILL.md) |
| Skrip | [`docs/architecture/overview.md`](./docs/architecture/overview.md) |
| Audit katalog | [`skills/audit-catalog/SKILL.md`](./skills/audit-catalog/SKILL.md) |

## Alur

```
1. Buat branch      → git switch -c feat/<topik>
2. Lakukan perubahan
3. Validasi         → node scripts/validate-manifest.mjs
4. Cek path         → node scripts/check-paths.mjs
5. Update CHANGELOG → bagian [Unreleased]
6. Commit           → Conventional Commits
7. Pull request
```

## Gate Kualitas

Wajib lulus sebelum merge:

```powershell
node scripts/validate-manifest.mjs --strict
node scripts/check-paths.mjs
node --check app.js
```

Untuk perubahan UI, tambahkan:

- [ ] Dashboard menampilkan semua project tanpa console error
- [ ] Pencarian dan filter bekerja
- [ ] Tema gelap & terang sama-sama baik
- [ ] Layout aman di 360px

## Standar Data

Lihat [`docs/architecture/manifest-schema.md`](./docs/architecture/manifest-schema.md).

Hal yang paling sering salah:

| Kesalahan | Perbaikan |
| --- | --- |
| `dir` tidak persis nama folder | Samakan persis |
| `id` mengandung spasi/underscore | Gunakan kebab-case |
| `docs` menunjuk file yang tidak ada | Hapus atau buat file-nya |
| `status` dibiarkan `active` padahal arsip | Set `maintenance`/`archived` |
| `stack` terlalu umum | Tulis teknologi konkret |

## Commit Message

```
<type>(<scope>): <ringkasan>

<body opsional — jelaskan "mengapa">
```

`type`: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.

Contoh:

```
feat(catalog): tambah project terranox-os

Terranox OS sudah stabil dan layak masuk kategori civic.
Repo pribadi, 16 commit, dokumentasi arsitektur tersedia.
```

## Melaporkan Masalah

Gunakan template yang tersedia:

- [Bug katalog](./.github/ISSUE_TEMPLATE/catalog-issue.md)
- [Usulan project](./.github/ISSUE_TEMPLATE/new-project.md)

## Pertanyaan

Baca dulu:

- [`docs/guides/getting-started.md`](./docs/guides/getting-started.md)
- [`docs/guides/scope-and-exclusions.md`](./docs/guides/scope-and-exclusions.md)
- [`docs/guides/conventions.md`](./docs/guides/conventions.md)

## Lisensi Kontribusi

Dengan berkontribusi, Anda menyetujui kontribusi dilisensikan di bawah MIT (lihat [`LICENSE`](./LICENSE)).
