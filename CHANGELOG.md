# Changelog

Semua perubahan penting pada hub Super Apps dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Added

- Project `biochemverse` (BioChemVerse) pada kategori Education & Experiments: entri manifest, junction `BioChemVerse/`, dan halaman `docs/projects/biochemverse.md`.
- Project `chemsphere` (ChemSphere) pada kategori Education & Experiments: entri manifest dan halaman `docs/projects/chemsphere.md` (junction sudah ada sebelumnya).
- Halaman detail project di dashboard (rencana v1.1).
- Sidebar project di sisi kiri dengan daftar pilihan project, progress bar 0–100, dan ringkasan audit kerentanan.
- Skrip audit AI per project untuk dependency dan konfigurasi melalui endpoint GriphubRouter yang kompatibel OpenAI.

### Changed

- Memodernisasi dashboard dengan ringkasan statistik berbentuk panel, hierarki header yang lebih lapang, pemisah grup, dan kartu yang lebih lega serta responsif.
- Hasil audit AI Al-Hikmah AI tercatat sebagai `attention` dengan 11 temuan yang perlu ditinjau.
- Auditor AI di Windows membaca kredensial dari User environment saat terminal aktif belum mewarisinya.

## [1.0.0] - 2026-10-26

Rilis perdana hub Super Apps.

### Added

**Katalog**
- `projects.manifest.json` — 42 project personal dalam 8 kategori, dengan blok `exclusions`
  berisi 38 folder yang sengaja dikecualikan beserta alasannya.
- Kategori: AI & ML (8), Legal Tech (4), Business & Operations (7), Civic & Public Sector (6),
  Games & Interactive (7), Tools & Utilities (4), Education & Experiments (3), Portfolio & Personal (3).

**Dashboard**
- `index.html` + `app.js` — shell statis tanpa dependency: pencarian multi-kata,
  filter kategori, statistik, badge status, tag stack, tombol salin path, tombol repo,
  tema gelap/terang dengan `localStorage`, shortcut `/`.

**Skrip**
- `scripts/validate-manifest.mjs` — validasi skema, duplikat id, kategori, status, keberadaan folder & docs.
- `scripts/check-paths.mjs` — verifikasi folder project dan metadata git.
- `scripts/audit-stale.mjs` — deteksi project tanpa commit melewati ambang hari.
- `scripts/generate-project-docs.mjs` — generator massal halaman dokumentasi.
- `scripts/new-project-doc.mjs` — skeleton dokumentasi satu project.

**Dokumentasi**
- 42 halaman di `docs/projects/`.
- Arsitektur: `overview.md`, `manifest-schema.md`, `tech-landscape.md`.
- ADR: `0001-manifest-as-source-of-truth`, `0002-static-zero-dependency-shell`, `0003-ownership-scope`.
- Design: `design-system.md`, `dashboard-spec.md`, `branding.md`.
- Panduan: `getting-started.md`, `scope-and-exclusions.md`, `project-doc-template.md`,
  `conventions.md`, `maintenance.md`, serta `roadmap.md`.
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`.

**Agent & Skill**
- Agent: `orchestrator`, `catalog-curator`, `docs-writer`, `code-reviewer`, `release-manager`.
- Skill: `add-project`, `audit-catalog`, `scaffold-readme`, `design-tokens`.

**Infrastruktur**
- CI validasi manifest (`.github/workflows/validate.yml`).
- Template issue katalog & usulan project.
- Contoh konfigurasi `infra/`.

### Notes

- Ruang lingkup ditentukan dari data git nyata (remote origin + author history), bukan asumsi.
- Proyek kantor (Jogjaprov/Aptika/Portal Layanan), upstream open source pihak ketiga,
  dan folder backup/stub/kosong dikecualikan sesuai `docs/guides/scope-and-exclusions.md`.
- Audit awal: 42/42 folder ditemukan, 0 kosong, 0 project melewati ambang 180 hari tanpa commit.
- `paymentreceipt-quality` teridentifikasi sebagai working copy QC (bukan produk terpisah)
  dari `paymentreceipt-v2` dan diset `maintenance`.

---

## Format Panduan

| Bagian | Untuk |
| --- | --- |
| `Added` | Fitur, project, dokumen baru |
| `Changed` | Perubahan perilaku/data |
| `Deprecated` | Akan dihapus |
| `Removed` | Dihapus |
| `Fixed` | Perbaikan bug/data |
| `Security` | Perbaikan keamanan |
