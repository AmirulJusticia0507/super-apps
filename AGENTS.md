# AGENTS.md — Aturan Kerja Agent AI

Panduan untuk agent AI (dan manusia) yang bekerja di repositori **Super Apps**.

## Apa Repositori Ini

Hub katalog untuk **42 project personal** milik Amirul Putra Justicia yang berada di `C:/laragon/www`. Super Apps **tidak** berisi kode project — hanya manifest, dashboard statis, skrip, dan dokumentasi.

## Aturan Emas

1. **Manifest adalah sumber kebenaran.** Data project hanya boleh berasal dari `projects.manifest.json`.
2. **Non-invasif.** Jangan mengubah file di luar `C:/laragon/www/super-apps` kecuali user secara eksplisit meminta. Folder project lain bersifat *read-only*.
3. **Zero dependency.** Jangan menambah `package.json`, framework, atau bundler ke hub.
4. **Jangan mengarang data.** Verifikasi dari git, README, dan struktur folder.
5. **Hormati ruang lingkup.** Hanya project milik sendiri (lihat `docs/guides/scope-and-exclusions.md`).
6. **Verifikasi dengan menjalankan.** Jangan klaim "sudah dicek" tanpa output perintah.

## Sebelum Mulai

Baca sesuai tugas:

| Tugas | Baca |
| --- | --- |
| Data katalog | `docs/architecture/manifest-schema.md` |
| Menulis docs | `docs/guides/conventions.md`, `docs/guides/project-doc-template.md` |
| Kode dashboard | `docs/design/dashboard-spec.md`, `docs/design/design-system.md` |
| Kode skrip | `docs/architecture/overview.md` |
| Ruang lingkup | `docs/guides/scope-and-exclusions.md` |

## Perintah Wajib Setelah Perubahan Data

```powershell
cd C:\laragon\www\super-apps
node scripts/validate-manifest.mjs
```

Jika mengubah folder/path:

```powershell
node scripts/check-paths.mjs
```

Jika mengubah UI:

```powershell
python -m http.server 8811
# buka http://localhost:8811/ → periksa console
```

## Struktur Peran

| Peran | File | Kapan dipakai |
| --- | --- | --- |
| Orchestrator | `agents/orchestrator.md` | Permintaan kompleks / multi-langkah |
| Catalog Curator | `agents/catalog-curator.md` | Menambah, mengubah, mengaudit entri manifest |
| Docs Writer | `agents/docs-writer.md` | Menulis/memperbarui dokumentasi |
| Code Reviewer | `agents/code-reviewer.md` | Meninjau perubahan `app.js`, `index.html`, `scripts/` |
| Release Manager | `agents/release-manager.md` | Menaikkan versi & CHANGELOG |

## Skill

| Skill | File | Kapan dipakai |
| --- | --- | --- |
| Add Project | `skills/add-project/SKILL.md` | Menambah project baru |
| Audit Catalog | `skills/audit-catalog/SKILL.md` | Audit menyeluruh |
| Scaffold README | `skills/scaffold-readme/SKILL.md` | Menulis README project lain |
| Design Tokens | `skills/design-tokens/SKILL.md` | Mengubah tampilan dashboard |

## Peta File Kunci

```
projects.manifest.json          # data — 99% perubahan data ada di sini
index.html                      # shell + seluruh CSS (token di <style>)
app.js                          # renderer manifest → UI
scripts/validate-manifest.mjs   # gate kualitas utama
docs/projects/<id>.md           # satu halaman per project (42 file)
```

## Pola Umum

### Menambah project

Ikuti `skills/add-project/SKILL.md` — verifikasi kepemilikan → tulis entri → validasi → generate docs → CHANGELOG.

### Mengubah tampilan

Ikuti `skills/design-tokens/SKILL.md` — token di kedua tema → uji kontras → perbarui design system.

### Menulis dokumentasi

Ikuti `docs/guides/project-doc-template.md`. Fakta saja; `TODO:` untuk yang tidak diketahui.

## Larangan

| ❌ | Alasan |
| --- | --- |
| Mengubah kode project lain | Hub bukan monorepo |
| Menyalin source/kode instansi ke hub | Isu kepemilikan & privasi |
| Menaruh token, `.env`, dump DB | Akan terpublikasi |
| Rename `apps[].id` | Mematahkan tautan dokumentasi |
| Menambah dependency | Melanggar prinsip zero-dep |
| `git push`/`git tag` push tanpa izin | Alur user di `AGENTS.md` global: commit oke, push perlu hati-hati |
| Menghapus halaman docs tanpa alasan | Kehilangan riwayat konteks |
| Mengarang perintah/perintah belum teruji | Menyesatkan |

## Gaya Commit

Conventional Commits:

```
feat(catalog): tambah project terranox-os
fix(manifest): koreksi dir invitation-wedding_apps
docs(guides): tambah panduan pemeliharaan
chore(release): v1.1.0
```

## Gaya Komunikasi

- Bahasa Indonesia, ringkas, langsung ke hasil.
- Sebut path file yang berubah.
- Tampilkan output perintah verifikasi.
- Jika ada keputusan ambigu (status project, kategori), ajukan pilihan — jangan diam-diam memutuskan.
