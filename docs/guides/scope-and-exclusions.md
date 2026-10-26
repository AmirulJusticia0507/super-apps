# Cakupan & Pengecualian

Dokumen ini menjelaskan **apa yang masuk** Super Apps, **apa yang sengaja dikeluarkan**, dan **mengapa**. Keputusan arsitekturnya ada di [ADR-0003](../architecture/adr/0003-ownership-scope.md); daftar mesinnya ada di `projects.manifest.json` → `exclusions`.

## Aturan Inti

> Super Apps hanya menampung project **milik Amirul Putra Justicia**.

Tiga jalur inklusi:

| # | Kriteria | Contoh |
| --- | --- | --- |
| 1 | Remote origin `github.com/AmirulJusticia0507/*` | `lex-integrity`, `presensi-go`, `kebun_tebu` |
| 2 | Riwayat git didominasi author milik sendiri | `cvamirulputrajusticia` (author campuran tapi milik sendiri) |
| 3 | Working copy lokal tanpa git, terbukti karya sendiri | `presensigo_mobile` |

Author yang diakui: `amirulputra0507`, `AmirulJusticia0507`, `amirulpj`, `amirul.justicia0507`, `amirulputraj`.

## Hasil Audit Workspace

Workspace berisi **84 entri**. Hasil:

| Klasifikasi | Jumlah | Keputusan |
| --- | --- | --- |
| Project personal (masuk katalog) | 42 | ✅ |
| Repo kantor / instansi | 27 | ❌ |
| Upstream open source pihak ketiga | 4 | ❌ |
| Bukan codebase / kosong / stub | 6 | ❌ |
| File non-project (`go.work`, `index.php`, dll.) | — | diabaikan |

## Yang Dikecualikan

### A. Repo kantor (Jogjaprov / Aptika / Portal Layanan)

| Folder | Alasan |
| --- | --- |
| `abhipraya-example-be`, `abhipraya-example-fe` | Repo Baperida (instansi) |
| `be-baperida`, `fe-baperida` | Repo Baperida |
| `be-jogjis`, `jogjis-be` | Microservice instansi |
| `be-layanan`, `fe-layanan` | Repo Aptika |
| `bruno-api-doc` | Koleksi API instansi |
| `dash-people` | Repo instansi |
| `dinsos-manunggalr`, `dinsos-manunggalr-dummy-api`, `be_dinsos_manunggalr` | Repo instansi (yang terakhir juga kosong) |
| `diygov-starter-be` | Starter kedinasan |
| `dtsen-manager-be`, `dtsen-manager-fe` | Repo instansi (People) |
| `fe-analytic-cctc` | Repo Portal Layanan instansi |
| `fe-survey` | Repo instansi |
| `jdih-fe-vue` | Repo JDIH instansi |
| `peladen-be`, `peladen-fe` | Repo instansi |
| `people-gw-gin`, `people-service` | Repo instansi (People) |
| `portal-dinsos`, `portal-web` | Repo instansi |
| `repo-manunggal-dtsen` | Repo instansi |
| `sireda` | Repo pihak lain (`putraaditya1877`) |
| `sistem-informasi-manajemen-evaluasi-dampak-it` | Repo instansi |
| `fe-publik-manunggalraharja-dtks` | Author lain (akbar, Noval Saputra) |
| `sarpras-fe` | Author lain (tim Aptika) |
| `rest-apis` | Author lain (`dianghazy`) |

### B. Upstream open source pihak ketiga

| Folder | Remote | Bukti |
| --- | --- | --- |
| `odysseus` | `pewdiepie-archdaemon/odysseus` | 1000+ commit, ratusan kontributor |
| `OmniRoute` | `diegosouzapw/OmniRoute` | 8000+ commit, ratusan kontributor |
| `WhatsApp-OSINT` | `kinghacker0/WhatsApp-OSINT` | Author `Mohit Kumar` |
| `getcontact-cli` | `xdreizein666/getcontact-cli` | Author `mfajarb` |

### C. Bukan codebase

| Folder | Alasan |
| --- | --- |
| `260210_biropiwpp_webbiropiwpp_backup` | Backup WordPress (public_html + .sql + .zip) |
| `ai-service` | Satu file `main.py` stub |
| `be_dinsos_manunggalr` | Direktori kosong |
| `manunggal-raharja` | Mockup statis tanpa git, sudah tergantikan repo `repo-manunggal-dtsen` |

## Yang Masuk — Kasus Batas yang Perlu Dijelaskan

| Folder | Kenapa masuk walaupun tampak ambigu |
| --- | --- |
| `e-lawyer` | 107 commit, semuanya author sendiri. `e-lawver` (typo) adalah duplikat lokal tanpa git — diperlakukan sebagai bagian `e-lawyer`. |
| `presensi-go` + `presensigo_mobile` | Satu produk, dua folder: `presensi-go` (monorepo dengan backend + mobile) dan `presensigo_mobile` (ekstrak Flutter tanpa git). Keduanya dimiliki sendiri. |
| `paymentreceipt`, `paymentreceipt-v2`, `paymentreceipt-quality` | Tiga generasi perawatan produk yang sama. Tetap dicatat sebagai **satu entri masing-masing** karena folder & riwayat commit berbeda. |
| `Tetris` | Meski ada one-off commit kontributor lain, riwayat didominasi sendiri dan repo di akun pribadi. |
| `v0-portfolio` | Dibuat dengan bantuan `v0[bot]` (generator), tetapi repo & kepemilikan milik sendiri. |

## Cara Mengaudit Ulang

```powershell
# Semua folder + remote
Get-ChildItem C:\laragon\www -Directory | ForEach-Object {
  $r = git -C $_.FullName remote get-url origin 2>$null
  "$($_.Name) => $r"
}

# Author history untuk folder tertentu
git -C C:\laragon\www\<folder> log --format='%an <%ae>' -n 400 | Sort-Object -Unique
```

Bila sebuah folder berpindah kepemilikan (mis. di-open-source-kan dengan izin instansi):

1. Hapus dari `exclusions.excluded` dan `exclusions.notes`.
2. Tambah objek ke `apps[]`.
3. Jalankan `node scripts/generate-project-docs.mjs`.
4. Catat di `CHANGELOG.md`.

Sebaliknya, bila sebuah project personal berpindah ke organisasi pihak lain dan bukan lagi milik Anda — keluarkan dari katalog.

## Prinsip Privasi

Beberapa project instansi bersifat internal. Katalog ini **tidak**:

- Menyalin source code project instansi ke hub.
- Mempublikasikan URL internal, kredensial, atau struktur API instansi.
- Memasukkan project instansi ke portofolio publik.

Nama project instansi hanya disebut sekali di dokumen ini sebagai catatan eksklusi, tanpa detail teknis.
