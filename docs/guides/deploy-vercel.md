# Deploy ke Vercel

Super Apps adalah situs statis murni (HTML + CSS + JS + JSON), tanpa backend dan tanpa build step.
Karena itu deploy-nya sangat sederhana — dan **tidak ada skrip Node yang ikut berjalan di Vercel**
(`scripts/*.mjs` hanya untuk lokal/CI).

---

## ⚠️ Baca Dulu — Privasi

Sebelum deploy ke URL publik, pahami bahwa **seluruh isi repo ikut terpublikasi**, termasuk:

| Berkas | Isi sensitif? |
| --- | --- |
| `projects.manifest.json` | Nama project, path lokal (`C:/laragon/www/...`), URL repo |
| `docs/guides/scope-and-exclusions.md` | **Daftar 38 folder kantor/instansi yang dikecualikan** |
| `docs/projects/*.md` | Stack, arsitektur, utang teknis tiap project |
| `AGENTS.md`, `infra/` | Path lokal, konfigurasi |

Yang **tidak** terjadi: tidak ada source code project kantor yang diunggah, karena hub hanya
berisi metadata. Namun dokumen eksklusi menyebut nama repo internal instansi.

**Rekomendasi**: untuk deploy publik, jalankan dulu pemeriksaan di bagian
[Skenario aman untuk publik](#skenario-aman-untuk-publik).

---

## Opsi 1 — Git Integration (disarankan)

Setiap push ke `main` otomatis deploy. Paling mudah dirawat.

1. Buka <https://vercel.com/new>.
2. **Import Git Repository** → pilih `AmirulJusticia0507/super-apps`.
3. Isi:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: kosong (override → nonaktif)
   - **Output Directory**: `.`
   - **Install Command**: kosong
4. **Deploy**.

Hasilnya URL seperti `https://super-apps.vercel.app`. Setiap `git push origin main` memicu deploy baru.

> Tanpa `vercel.json`, Vercel tetap bisa menyajikan folder ini, tetapi `vercel.json` memastikan
> tidak ada build yang dicoba dan menambahkan header keamanan serta `no-cache` pada manifest.

## Opsi 2 — Vercel CLI

Untuk deploy langsung dari folder ini tanpa lewat dashboard:

```powershell
cd C:\laragon\www\super-apps

# sekadar coba: preview
vercel deploy

# publikasikan ke production
vercel deploy --prod
```

Pertama kali, CLI akan bertanya: mau **link ke project baru** atau yang sudah ada.
Pilih nama project `super-apps`.

Perintah bantu:

```powershell
vercel whoami              # cek akun yang login
vercel ls                  # daftar deployment
vercel inspect <url>       # detail deployment
vercel logs <url>          # log runtime
vercel domains ls          # domain yang terpasang
```

## Opsi 3 — `git push` (bila repo sudah terhubung)

Bila project Vercel sudah di-import dari GitHub:

```powershell
git add -A
git commit -m "chore: siapkan konfigurasi Vercel"
git push origin main
```

Vercel otomatis membangun dari commit terbaru.

---

## Konfigurasi yang Dipakai

### `vercel.json`

```json
{
  "framework": null,
  "installCommand": "",
  "buildCommand": "",
  "outputDirectory": ".",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    { "source": "/projects.manifest.json", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] }
  ],
  "rewrites": [{ "source": "/", "destination": "/index.html" }]
}
```

| Field | Alasan |
| --- | --- |
| `framework: null` | Mencegah Vercel mendeteksi framework dan mencoba build |
| `installCommand` / `buildCommand` kosong | Tidak ada dependency, tidak ada build |
| `outputDirectory: "."` | Yang disajikan adalah root repo apa adanya |
| `cleanUrls` | `/README` (tanpa `.md`) tetap dapat diakses rapi |
| `Cache-Control` manifest | Perubahan katalog langsung terlihat, tidak tertahan cache |
| `rewrites` | `/` selalu dilayani `index.html` |

### `.vercelignore`

Menyingkirkan `node_modules/`, `.vercel/`, `.env*`, dan artefak OS dari unggahan.

---

## Verifikasi Setelah Deploy

Jalankan pemeriksaan berikut pada URL hasil deploy:

```powershell
# 1. Halaman utama
curl.exe -s -o NUL -w "%{http_code}`n" https://<domain>/
# → 200

# 2. Manifest terbaca sebagai JSON
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://<domain>/projects.manifest.json
# → 200 application/json

# 3. Tidak ada HTML untuk aset
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://<domain>/app.js
# → 200 text/javascript (atau application/javascript)
```

Lalu di browser:

- [ ] 42 kartu tampil dalam 8 grup
- [ ] Kolom pencarian bekerja
- [ ] Filter kategori bekerja
- [ ] Toggle tema tersimpan setelah reload
- [ ] Console bersih (0 error)
- [ ] Tab Network: `projects.manifest.json` → 200

Cara cepat tanpa browser manual: buka DevTools → Console → jalankan

```js
document.querySelectorAll('.card').length   // harus 42
```

---

## Skenario Aman untuk Publik

Pilih salah satu sebelum mengumumkan URL.

### A. Deploy dengan repo privat (paling sederhana)

Ubah `AmirulJusticia0507/super-apps` menjadi **private** di GitHub, lalu hubungkan ke Vercel.
Vercel tetap dapat membaca repo privat milikmu. Isi repo jadi tidak bisa dibaca langsung publik —
hanya output statis yang terpublikasi.

Namun **ingat**: output statis tetap memuat semua berkas yang tidak di-`.vercelignore`.
Jadi lihat opsi B/C untuk menyaring isi.

### B. Publikasikan hanya dashboard

Tambahkan ke `.vercelignore` dokumentasi internal:

```
/docs/guides/scope-and-exclusions.md
/agents/
/skills/
/scripts/
/infra/
/.github/
/AGENTS.md
/CONTRIBUTING.md
```

Dashboard tetap berjalan penuh — ia hanya membutuhkan `index.html`, `app.js`, dan `projects.manifest.json`.

### C. Ganti nama instansi di dokumentasi

Ganti daftar folder instansi pada `docs/guides/scope-and-exclusions.md` dengan kategori umum
(mis. "repo instansi — 27 folder"), simpan daftar rinci di file lokal yang di-gitignore.

---

## Kustom Domain

1. Vercel → Project → **Settings → Domains** → **Add**.
2. Masukkan domain (mis. `super.amirul.dev`).
3. Ikuti instruksi DNS (`CNAME` ke `cname.vercel-dns.com`).
4. Tunggu verifikasi; sertifikat TLS dibuat otomatis.

---

## Rollback

Vercel menyimpan setiap deployment.

- Dashboard → **Deployments** → pilih versi lama → **⋯ → Promote to Production**.
- Atau CLI: `vercel rollback`.

---

## Batasan & Catatan

| Hal | Catatan |
| --- | --- |
| Tombol **Path** | Menyalin path lokal (`C:\laragon\www\...`) — tidak berarti bagi pengunjung publik |
| Tombol **Repo** | Tetap berfungsi (link GitHub publik) |
| Tanpa server | Tidak ada API, jadi tidak ada cold start maupun kuota fungsi |
| Biaya | Termasuk paket Hobby — hanya bandwidth & request statis |
| `file://` | Tidak relevan; Vercel selalu lewat HTTPS |

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Build gagal "No framework detected" | Build dicoba | Pastikan `vercel.json` ter-commit |
| Halaman 404 | Output directory salah | Harus `.` |
| Dashboard kosong, "Gagal memuat manifest" | Path manifest salah | Cek `/projects.manifest.json` langsung di browser |
| Manifest basi setelah update | Cache | Sudah ditangani header `must-revalidate`; hard refresh sekali |
| Deploy sukses tapi kartu 0 | `app.js` 404 | Cek `cleanUrls`/`outputDirectory` |

---

## Checklist Rilis Publik

- [ ] `vercel.json` & `.vercelignore` ter-commit
- [ ] `node scripts/validate-manifest.mjs --strict` lulus
- [ ] Keputusan privasi diambil (opsi A/B/C di atas)
- [ ] Deploy preview diuji: 42 kartu, console bersih
- [ ] Verifikasi `curl` pada tiga endpoint
- [ ] Promote ke production
- [ ] Catat URL di `README.md`
