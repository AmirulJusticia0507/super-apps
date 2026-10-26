# ADR-0001 — Manifest JSON sebagai sumber kebenaran

- **Status**: Diterima
- **Tanggal**: 2026-10-26
- **Konteks**: Super Apps

## Konteks

Ada 42 project personal dengan metadata yang tersebar di 42 README berbeda. Kita butuh satu tempat untuk mendaftar: nama, kategori, stack, status, repo, dokumentasi. Data ini akan dibaca oleh dashboard, skrip, dan dokumentasi.

## Keputusan

Gunakan **satu file JSON** — `projects.manifest.json` — sebagai satu-satunya sumber kebenaran katalog.

Alasan:

1. **Format universal** — bisa dibaca browser (`fetch`), Node (import/readFile), dan tool lain tanpa parser khusus.
2. **Tanpa database** — tidak ada server untuk dijalankan, jadi hub tetap bisa dipakai 10 tahun lagi.
3. **Reviewable di git** — setiap perubahan baris terlihat jelas di diff.
4. **Terverifikasi** — validator skema bisa menolak data buruk sebelum dashboard merender.

## Konsekuensi

**Positif**
- Satu edit memperbarui dashboard *dan* generator dokumentasi.
- Tidak ada drift antara UI dan data.

**Negatif**
- File bertambah besar; pada 100+ project dapat dipecah per kategori (manifest include).
- Tidak ada query relasional — pencarian dilakukan di sisi klien (cukup untuk skala ini).
- Edit manual bisa menghasilkan JSON rusak → selalu jalankan validator.

## Alternatif yang Ditolak

| Alternatif | Alasan ditolak |
| --- | --- |
| YAML | Komentar bagus, tapi parsing di browser butuh dependency tambahan. |
| Database (SQLite/Postgres) | Butuh server/runtime; berlebihan untuk data statis. |
| Frontmatter tiap README | Sulit diagregasi; 42 sumber, rawan drift; dashboard harus membaca 42 folder. |
| Hardcode di `app.js` | Melanggar prinsip manifest-first; tidak bisa dipakai skrip lain. |

## Tindak Lanjut

- Skema didokumentasikan di [`../manifest-schema.md`](../manifest-schema.md).
- Validasi otomatis di CI ([`../../../.github/workflows/validate.yml`](../../../.github/workflows/validate.yml)).
