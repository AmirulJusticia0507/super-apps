---
name: audit-catalog
description: Prosedur audit menyeluruh katalog Super Apps — mendeteksi entri basi, folder hilang, project di luar cakupan, dokumentasi tidak lengkap, dan ketidakkonsistenan antara manifest, workspace, dan dashboard.
---

# Skill: Audit Catalog

Tujuan: menemukan seluruh ketidaksesuaian antara **manifest**, **workspace nyata**, dan **dokumentasi** — lalu melaporkannya secara terukur.

Audit ini **read-only** sampai langkah perbaikan. Jangan mengubah status project tanpa dasar bukti.

## Langkah 1 — Gate Otomatis

```powershell
cd C:\laragon\www\super-apps
node scripts/validate-manifest.mjs --strict
node scripts/check-paths.mjs
node scripts/audit-stale.mjs --days 180
```

Catat: jumlah error, jumlah warning, jumlah path hilang, jumlah stale.

## Langkah 2 — Drift Workspace vs Katalog

Cari folder di workspace yang **tidak ada** di manifest maupun exclusions ([cek kepemilikan pakai skill `add-project` langkah 1]).

```powershell
$ws = "C:\laragon\www"
$known = @()
$known += (Get-Content "$ws\super-apps\projects.manifest.json" -Raw | ConvertFrom-Json).apps.dir
$known += (Get-Content "$ws\super-apps\projects.manifest.json" -Raw | ConvertFrom-Json).exclusions.excluded

Get-ChildItem $ws -Directory | Where-Object { $known -notcontains $_.Name } |
  ForEach-Object {
    $r = git -C $_.FullName remote get-url origin 2>$null
    [pscustomobject]@{ Folder = $_.Name; Remote = $r }
  } | Format-Table -AutoSize
```

Setiap hasil adalah **keputusan yang belum diambil**: masukkan ke `apps[]` atau `exclusions`.

## Langkah 3 — Verifikasi Status

Untuk setiap project `active`, cek usia commit:

```powershell
node scripts/audit-stale.mjs --days 365 --json > stale.json
```

Aturan penilaian:

| Kondisi | Usulan |
| --- | --- |
| `active` tapi > 365 hari tanpa commit | turunkan ke `maintenance` atau `archived` |
| `archived` tapi ada commit < 90 hari | naikkan ke `active` — statusnya keliru |
| `maintenance` tanpa commit > 730 hari | pertimbangkan `archived` |
| Project tanpa git | tetap `active` bila jelas masih dipakai; catat di `gaps` |

## Langkah 4 — Kualitas Entri

Periksa per entri:

- [ ] `tagline` informatif (bukan "Aplikasi" / "Project keren")
- [ ] `stack` sesuai isi folder (cek `go.mod`, `package.json`, dll.)
- [ ] `entry` benar-benar ada
- [ ] `docs` semua file ada
- [ ] `tags` membantu pencarian
- [ ] `repo` masih valid (buka atau `git ls-remote` bila perlu)
- [ ] id tidak berubah dari versi sebelumnya

Cek duplikat logis (produk sama, folder berbeda): mis. `paymentreceipt` vs `paymentreceipt-v2`. Pastikan keduanya punya keterangan yang membedakan.

## Langkah 5 — Dokumentasi

```powershell
Get-ChildItem docs\projects\*.md | Measure-Object     # harus = jumlah apps
Get-ChildItem C:\laragon\www\<folder> -Filter '*.md' -File | Select-Object Name  # vs field docs
```

Tandai halaman yang masih berisi `TODO:`:

```powershell
Select-String -Path docs\projects\*.md -Pattern '^TODO|TODO:' -List |
  Select-Object -ExpandProperty Filename
```

Project tanpa README di folder aslinya → catat di `apps[].gaps` (contoh: `invitation-wedding`).

## Langkah 6 — Konsistensi Dashboard

```powershell
python -m http.server 8811
```

Buka `http://localhost:8811/` dan pastikan:

- Jumlah kartu = jumlah `apps[]`
- Setiap kategori dengan ≥1 app punya grup
- Tidak ada console error
- Pencarian nama project yang baru diubah mengembalikan hasil

## Format Laporan

```markdown
# Audit Katalog — YYYY-MM-DD

## Ringkasan
| Metrik | Nilai |
| --- | --- |
| Project | 42 |
| Error validator | 0 |
| Folder hilang | 0 |
| Stale > 180 hari | 9 |
| Folder belum terklasifikasi | 2 |
| Docs dengan TODO | 12 |

## Temuan

### Tinggi (perlu tindakan)
| # | Project | Masalah | Usulan |
|---|---------|---------|--------|
| 1 | `foo` | `active` tapi 2 tahun tanpa commit | → `maintenance` |

### Sedang
...

### Rendah (kosmetik)
...

## Perbaikan yang Diusulkan
<daftar perubahan manifest — belum diterapkan>
```

## Setelah Audit

Terapkan perbaikan **hanya yang disetujui**, per kelompok:

```powershell
node scripts/validate-manifest.mjs
node scripts/check-paths.mjs
```

Lalu catat di `CHANGELOG.md` (`### Fixed` / `### Changed`).
