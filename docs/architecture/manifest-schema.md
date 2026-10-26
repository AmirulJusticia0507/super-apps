# Skema `projects.manifest.json`

Versi skema: **1** · File: [`projects.manifest.json`](../../projects.manifest.json)

## Bentuk Umum

```json
{
  "meta": { ... },
  "exclusions": { "policy": "...", "excluded": ["dir", ...], "notes": [ ... ] },
  "categories": [ { ... } ],
  "apps": [ { ... } ]
}
```

## `meta`

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `name` | string | ✓ | Nama hub (`Super Apps`) |
| `owner` | string | ✓ | Nama pemilik |
| `ownerHandle` | string | ✓ | Handle GitHub utama |
| `ownerEmail` | string | ✓ | Email identitas commit |
| `workspace` | string | ✓ | Root workspace absolut (POSIX style) |
| `version` | string | ✓ | Versi katalog (semver) |
| `updated` | string | ✓ | Tanggal update terakhir (`YYYY-MM-DD`) |
| `description` | string | — | Ringkasan |

## `exclusions`

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `policy` | string | ✓ | Aturan inklusi/eksklusi |
| `excluded` | string[] | ✓ | Nama folder yang sengaja tidak dimasukkan |
| `notes` | {repo, reason}[] | — | Alasan per folder yang perlu dijelaskan |

> Folder di `excluded` **tidak boleh** muncul di `apps[].dir`. Validator menolak duplikasi ini.

## `categories[]`

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `id` | string (kebab) | ✓ | ID unik kategori |
| `name` | string | ✓ | Nama tampilan |
| `icon` | string | ✓ | Kunci ikon (`brain`, `scale`, `briefcase`, `landmark`, `gamepad`, `wrench`, `graduation`, `user`) |
| `color` | string (hex) | ✓ | Warna aksen kategori |

Urutan array menentukan urutan grup di dashboard.

## `apps[]`

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `id` | string (kebab) | ✓ | ID unik; sama dengan `docs/projects/<id>.md` |
| `dir` | string | ✓ | Nama folder persis di workspace |
| `name` | string | ✓ | Nama produk |
| `tagline` | string | ✓ | Satu baris deskripsi |
| `category` | string | ✓ | Harus ada di `categories[].id` |
| `status` | enum | ✓ | `active` \| `maintenance` \| `archived` |
| `stack` | string[] | ✓ | Minimal 1 teknologi |
| `repo` | string (URL) | — | Remote URL; kosong bila lokal |
| `entry` | string | — | File/folder entry point |
| `docs` | string[] | — | Path dokumen relatif ke folder project |
| `tags` | string[] | — | Kata kunci pencarian tambahan |
| `gaps` | string[] | — | Kekurangan yang diketahui (tanpa README, dll.) |
| `progress` | integer | — | Kemajuan project, 0–100. Tidak diisi berarti belum dinilai. |
| `security` | object | — | Ringkasan audit kerentanan; tidak diisi berarti belum diaudit. |

### `apps[].security`

| Field | Tipe | Wajib bila `security` ada | Keterangan |
| --- | --- | --- | --- |
| `status` | enum | ✓ | `clear`, `attention`, atau `critical` |
| `findings` | integer ≥ 0 | ✓ | Jumlah temuan terbuka dari audit terakhir |
| `reviewed` | string | — | Tanggal audit `YYYY-MM-DD` |

Progress dan security hanya boleh diisi dari pencatatan kemajuan atau audit nyata. Dashboard menampilkan status **Belum dinilai** dan **Belum diaudit** saat field tidak ada.

### Aturan Status

| Status | Arti | Kriteria |
| --- | --- | --- |
| `active` | Dikerjakan atau dipakai aktif | Ada commit dalam ~6 bulan, atau sedang dijadikan portofolio |
| `maintenance` | Hanya perbaikan | Stabil, tidak ada fitur baru |
| `archived` | Tidak dikembangkan | Disimpan sebagai referensi / sudah digantikan |

### Aturan `id`

- Kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Stabil — jangan diganti setelah dipublikasikan (ia menjadi anchor dokumentasi).
- Boleh berbeda dari `dir`. Contoh nyata: folder `AI_LLM_Qur'an_Hadits` (mengandung spasi, apostrof, tanda petik) diberi id `al-hikmah-ai` agar aman di URL dan nama file.

### Aturan `dir`

- Harus **persis** sama dengan nama folder (case-sensitive pada sistem case-sensitive).
- Validator memeriksa keberadaan folder dan setiap path di `docs`.

## Contoh Entri

```json
{
  "id": "lex-integrity",
  "dir": "lex-integrity",
  "name": "Lex Integrity",
  "tagline": "Matriks kepatuhan kebijakan & regulasi lokal (MERN + local LLM)",
  "category": "legal",
  "status": "active",
  "repo": "https://github.com/AmirulJusticia0507/lex-integrity.git",
  "stack": ["MERN", "Ollama", "Qdrant", "Playwright", "Docker"],
  "entry": "server/",
  "docs": ["README.md", "PROJECT_PLAN.md", "RAG_GUIDELINE.md"],
  "tags": ["compliance", "scraper", "local-llm", "jdih"]
}
```

## Validasi

```bash
node scripts/validate-manifest.mjs          # warning untuk masalah ringan
node scripts/validate-manifest.mjs --strict # warning docs hilang menjadi error
```

Yang diperiksa:

- field wajib kosong → **error**
- id bukan kebab / duplikat → **error**
- kategori tak dikenal → **error**
- status tak dikenal → **error**
- folder project tidak ada → **warning**
- dokumen internal tidak ditemukan → **warning**
- `docs/projects/<id>.md` tidak ada → **warning** (`--strict`: error)
- folder di `exclusions` muncul di `apps` → **error**

## Migrasi Skema

Skema saat ini **1**. Jika berubah:

1. Tambah field baru sebagai **opsional** dulu.
2. Perbarui validator agar memberi warning, bukan error.
3. Setelah dashboard menangani field itu, naikkan `meta.version`.
4. Catat perubahan di [`CHANGELOG.md`](../../CHANGELOG.md).
