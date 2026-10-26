# Konvensi

Konvensi yang berlaku di hub Super Apps. Untuk konvensi di dalam repo project, ikuti konvensi repo masing-masing — hub tidak memaksakan gaya.

## Penamaan

| Objek | Aturan | Contoh |
| --- | --- | --- |
| `apps[].id` | kebab-case, stabil | `lex-integrity`, `al-hikmah-ai` |
| File docs project | `<id>.md` | `docs/projects/lex-integrity.md` |
| Kategori | kebab-case | `ai-ml`, `gov-public` → kini `civic` |
| Skrip | kebab-case + `.mjs` | `validate-manifest.mjs` |
| ADR | `NNNN-judul-kebab.md` | `0001-manifest-as-source-of-truth.md` |

## Status Project

| Status | Pakai saat |
| --- | --- |
| `active` | Sedang dikembangkan, dipakai, atau dijadikan portofolio |
| `maintenance` | Stabil; hanya perbaikan bug/keamanan |
| `archived` | Tidak dikembangkan; disimpan sebagai referensi |

Turunkan status secara eksplisit; jangan biarkan `active` padahal sudah lama mati.

## Commit

Format: **Conventional Commits** (untuk repo hub).

```
<type>(<scope>): <ringkasan>

[body opsional]
```

| Type | Untuk |
| --- | --- |
| `feat` | Data/fitur baru di katalog (project baru, kategori) |
| `fix` | Koreksi path, id, atau data salah |
| `docs` | Perubahan dokumentasi |
| `refactor` | Ubah struktur tanpa ubah hasil |
| `chore` | Skrip, CI, konfigurasi |

Contoh:

```
feat(catalog): tambah project terranox-os ke kategori civic
fix(manifest): koreksi dir invitation-wedding_apps
docs(adr): tambah ADR-0003 tentang ruang lingkup kepemilikan
```

## Branch

| Branch | Untuk |
| --- | --- |
| `main` | Selalu valid (`node scripts/validate-manifest.mjs` lulus) |
| `docs/<topik>` | Perubahan dokumentasi |
| `feat/<topik>` | Fitur dashboard/skrip |
| `fix/<topik>` | Perbaikan data |

## Format Data di Manifest

- Urutan field konsisten: `id, dir, name, tagline, category, status, repo, stack, entry, docs, tags`.
- `stack`: nama teknologi populer (judul, bukan versi).
- `docs`: path relatif ke folder project, tanpa `./`.
- URL repo: lengkap dengan `.git` bila git remote, tanpa slash di akhir.
- Jangan menambah komentar — JSON tidak mendukung komentar.

## Markdown

- Satu `#` H1 per file, sama dengan judul produk.
- Tabel untuk data terstruktur, bullet untuk daftar longgar.
- Blok kode selalu bertag bahasa.
- Path Windows ditulis dengan `/`: `C:/laragon/www/...`.
- Mermaid untuk diagram proses.

## Bahasa

- UI & dokumentasi: **Indonesia**.
- Nama teknis (field, perintah, path) tetap **Inggris/apa adanya**.
- Tanggal: `YYYY-MM-DD` (ISO) di tabel; teks bebas boleh "26 Oktober 2026".

## Aksesibilitas

- Semua kontrol interaktif: elemen semantik + label.
- Warna tidak boleh satu-satunya pembeda informasi.

## Anti-Pola

| Jangan | Karena |
| --- | --- |
| Hardcode project di `app.js` | Melanggar manifest-first |
| Menyalin source project ke hub | Hub bukan monorepo |
| Menambah dependency ke hub | Mematahkan prinsip zero-dep |
| Rename `id` setelah rilis | Mematahkan tautan dokumentasi |
| Menaruh rahasia di manifest/docs | Akan terpublikasi |
