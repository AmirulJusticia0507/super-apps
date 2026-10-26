# 🚀 Super Apps

> **Hub & master catalog** untuk seluruh project personal **Amirul Putra Justicia** — 42 project, 8 kategori, satu pintu masuk.

Super Apps bukan aplikasi monolit baru. Ini adalah **lapisan orkestrasi** di atas project-project yang sudah ada di `C:\laragon\www`: satu dashboard untuk menemukan, membuka, dan mendokumentasikan setiap project, plus standar bersama (agent, skill, design system, arsitektur, dan dokumentasi).

---

## Daftar Isi

- [Kenapa Super Apps](#kenapa-super-apps)
- [Mulai Cepat](#mulai-cepat)
- [Struktur Repo](#struktur-repo)
- [Katalog Project](#katalog-project)
- [Cakupan & Pengecualian](#cakupan--pengecualian)
- [Menambah / Mengubah Project](#menambah--mengubah-project)
- [Perintah Harian](#perintah-harian)
- [Dokumentasi](#dokumentasi)
- [Konvensi](#konvensi)
- [Roadmap](#roadmap)
- [Lisensi](#lisensi)

---

## Kenapa Super Apps

Setelah bertahun-tahun mengerjakan puluhan project (AI, legal-tech, ERP, game, kewargaan, portfolio), muncul tiga masalah berulang:

1. **Sulit menemukan** project mana yang memakai stack apa, statusnya apa, dan dokumentasinya di mana.
2. **Tidak ada standar bersama** — README, penamaan, agent, dan design berbeda-beda per repo.
3. **Tidak ada titik masuk tunggal** untuk mendemokan portofolio ke publik, klien, atau rekruter.

Super Apps menyelesaikannya dengan **satu manifest, satu dashboard, satu set standar**. Semua data project berada di [`projects.manifest.json`](./projects.manifest.json) — satu-satunya sumber kebenaran (*single source of truth*).

---

## Mulai Cepat

Super Apps berjalan tanpa dependency dan tanpa build step.

```bash
# 1. Masuk ke folder
cd C:\laragon\www\super-apps

# 2. Sajikan lewat HTTP (fetch manifest butuh origin, bukan file://)
npx serve .          # atau: python -m http.server 8080
```

Buka `http://localhost:3000` (atau port yang ditampilkan).

**Fitur dashboard**

| Fitur | Cara pakai |
| --- | --- |
| Cari project | Ketik di kolom pencarian, atau tekan `/` |
| Filter kategori | Klik chip kategori |
| Ganti tema | Tombol ☀️ / 🌙 (tersimpan di `localStorage`) |
| Salin path project | Tombol **Path** pada kartu |
| Buka repo | Tombol **Repo ↗** |

Bisa juga dijalankan lewat Laragon: letakkan virtual host ke folder ini, atau buka `http://localhost/super-apps/`.

---

## Struktur Repo

```
super-apps/
├── index.html                 # Dashboard shell (zero-dep)
├── app.js                     # Renderer: manifest → kartu, filter, search
├── projects.manifest.json     # ⭐ Sumber kebenaran katalog (42 project)
├── AGENTS.md                  # Aturan kolaborasi untuk agent AI
├── CHANGELOG.md               # Riwayat perubahan hub
├── CONTRIBUTING.md            # Cara berkontribusi & mengubah katalog
├── LICENSE
├── agents/                    # Definisi subagent (peran kerja)
│   ├── orchestrator.md
│   ├── catalog-curator.md
│   ├── docs-writer.md
│   ├── code-reviewer.md
│   └── release-manager.md
├── skills/                    # Skill reusable (prosedur kerja)
│   ├── add-project/SKILL.md
│   ├── audit-catalog/SKILL.md
│   ├── scaffold-readme/SKILL.md
│   └── design-tokens/SKILL.md
├── docs/
│   ├── architecture/          # Arsitektur hub & keputusan (ADR)
│   ├── design/                # Design system & guideline visual
│   ├── guides/                # Panduan operasional
│   └── projects/              # Satu halaman per project (42 file)
├── infra/                     # Docker, compose, nginx, contoh env
├── scripts/                   # Otomasi (validasi, sinkronisasi, cek path)
└── .github/                   # Workflow CI & template issue
```

---

## Katalog Project

### 🧠 AI & Machine Learning (8)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Al-Hikmah AI** | Platform Qur'an & Hadits berbasis AI | Next.js, Python, LLM |
| **Boso Jawa AI** | Asisten bahasa & terjemahan Jawa | FastAPI, Next.js, Transformers |
| **STT Engine** | Voice-to-text (Faster-Whisper) | FastAPI, Vue, Whisper |
| **FaceAI** | Pengenalan wajah end-to-end | Django, OpenCV |
| **Comic-to-Video AI** | Generator video dari panel komik | FastAPI, React, FFmpeg |
| **LeafLens** | Identifikasi daun dengan local AI | React Native, TensorFlow |
| **PharmAI** | Analisis obat & interaksi farmasi | Next.js, Python, LLM |
| **MedMatch** | Pencocokan pasien–tenaga medis | MERN, .NET |

### ⚖️ Legal Tech (4)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Lex-DSS** | Decision support hukum berbasis AI | FastAPI, React, LLM |
| **Lex Integrity** | Matriks kepatuhan regulasi (MERN + local LLM) | MERN, Ollama, Qdrant |
| **e-Lawyer** | Platform legal-tech advokat & pengadilan | Node.js, React, PostgreSQL |
| **e-Notary BPRS** | Manajemen notaris syariah | Go, Keycloak, React |

### 💼 Business & Operations (7)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Payment Receipt v2** | PR & payment receipt enterprise | Go, React, PostgreSQL |
| **Payment Receipt (Quality)** | Working copy QC dari v2 (branch `agent/quality-guardrails`) | Go, React |
| **Payment Receipt (Legacy)** | Versi PHP | PHP, MySQL, FPDF |
| **Payment Receipt System** | ERP modular (finance, inventory, sales) | Django |
| **JMC Inventory App** | Fullstack inventaris | Node.js, React |
| **FigureVault API** | Marketplace collectibles | Spring Boot |
| **Healthcare Queue Engine** | Antrian & penjadwalan | Node.js, React |

### 🏛️ Civic & Public Sector (6)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **e-Voting Netizen** | Sistem pemungutan suara elektronik | Go, Flutter |
| **SiTani DIY** | Portal pertanian & ketahanan pangan | Go, React, PostGIS |
| **Kebun Tebu** | Monitoring kebun tebu berbasis peta | Laravel, Leaflet |
| **Samsat Inquiry** | Inquiry kendaraan & pajak | React, TypeScript |
| **TRAXIS** | MRT & KRL transit management | Angular, PostGIS |
| **Terranox OS** | Spatial & real-estate master plan | Next.js, Prisma, PostGIS |

### 🎮 Games & Interactive (7)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Ancient Empire PC** | Game strategy | Godot |
| **Wayang Kancil** | Web game cerita rakyat | Node.js, Canvas |
| **Mahjong Online** | Mahjong multiplayer | Node.js, Socket.IO |
| **Tetris** | Tetris + panel admin | PHP, MySQL |
| **41 Cards** | Card game multiplayer | Node.js, Upstash |
| **Mini Golf** | Game mini golf HTML5 | Canvas |
| **Ular Tangga** | Game ular tangga | HTML5, JS |

### 🛠️ Tools & Utilities (4)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Primbon App** | Kalkulator primbon Jawa | Go |
| **OTP Token SSO ASN** | Kredensial & OTP SSO | Node.js, TOTP |
| **PresensiGo** | Smart attendance + geofencing | Go, Flutter, Redis |
| **PresensiGo Mobile** | Aplikasi Flutter | Flutter |

### 🎓 Education & Experiments (3)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **Algoritma & Struktur Data** | Kumpulan implementasi + visualisasi | Node.js, React |
| **Event Queue (3SevenLab)** | Tugas embedded systems (C) | C |
| **DNA Analysis Dashboard** | Analisis & visualisasi DNA | Express, React |

### 👤 Portfolio & Personal (3)

| Project | Deskripsi | Stack |
| --- | --- | --- |
| **CV Amirul Putra Justicia** | Website CV + cover letter generator | PHP, PostgreSQL |
| **Portfolio (Next.js)** | Website portfolio personal | Next.js, shadcn/ui |
| **Invitation Wedding Apps** | Undangan digital + RSVP | PHP, PWA |

> Detail per project (entry point, dokumentasi internal, catatan migrasi) ada di [`docs/projects/`](./docs/projects/).

---

## Cakupan & Pengecualian

Katalog ini **hanya** memuat project yang benar-benar Anda buat.

**Kriteria inklusi** — project masuk katalog jika salah satu terpenuhi:

1. Remote repo adalah `github.com/AmirulJusticia0507/*` (akun pribadi), **atau**
2. Git author history milik Anda (`amirulputra0507`, `AmirulJusticia0507`, `amirulpj`, `amirul.justicia0507`), **atau**
3. Working copy lokal tanpa git yang terbukti karya Anda dan belum tergantikan repo lain.

**Yang dikecualikan** (tercatat beserta alasannya di [`projects.manifest.json`](./projects.manifest.json) → `exclusions`):

- **Repo kantor / Jogjaprov** — abhipraya, be/fe-baperida, be-jogjis, jogjis-be, be/fe-layanan, bruno-api-doc, dash-people, dinsos-manunggalr (+dummy-api), diygov-starter-be, dtsen-manager-be/fe, fe-analytic-cctc, fe-survey, jdih-fe-vue, peladen-be/fe, people-gw-gin, people-service, portal-dinsos, portal-web, repo-manunggal-dtsen, sireda, sistem-informasi-manajemen-evaluasi-dampak-it, fe-publik-manunggalraharja-dtks, sarpras-fe, rest-apis
- **Third-party upstream** — odysseus, OmniRoute, WhatsApp-OSINT, getcontact-cli
- **Bukan codebase** — `260210_biropiwpp_webbiropiwpp_backup` (backup WordPress), `be_dinsos_manunggalr` (kosong), `ai-service` (stub 1 file), `manunggal-raharja` (mockup statis, tergantikan)

Aturan lengkap ada di [`docs/guides/scope-and-exclusions.md`](./docs/guides/scope-and-exclusions.md).

---

## Menambah / Mengubah Project

1. Tambahkan objek baru ke `apps[]` di `projects.manifest.json` (ikuti skema di [`docs/architecture/manifest-schema.md`](./docs/architecture/manifest-schema.md)).
2. Jalankan validasi:
   ```bash
   node scripts/validate-manifest.mjs
   ```
3. Tambahkan halaman `docs/projects/<id>.md` (gunakan template di [`docs/guides/project-doc-template.md`](./docs/guides/project-doc-template.md)).
4. Refresh browser — dashboard membaca manifest langsung.

Field wajib: `id`, `dir`, `name`, `tagline`, `category`, `status`, `stack`. Field opsional: `repo`, `entry`, `docs`, `tags`.

---

## Perintah Harian

```bash
node scripts/validate-manifest.mjs      # cek skema, duplikat id, slug kategori, file docs
node scripts/check-paths.mjs            # pastikan setiap `dir` ada di workspace
node scripts/audit-stale.mjs            # tandai project tanpa commit > 180 hari
node scripts/new-project-doc.mjs <id>   # buat skeleton docs/projects/<id>.md
```

Semua script zero-dependency (Node ≥ 18).

---

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/architecture/overview.md`](./docs/architecture/overview.md) | Arsitektur hub, alur data manifest → UI |
| [`docs/architecture/manifest-schema.md`](./docs/architecture/manifest-schema.md) | Skema & aturan field manifest |
| [`docs/architecture/tech-landscape.md`](./docs/architecture/tech-landscape.md) | Peta stack lintas project |
| [`docs/architecture/adr/`](./docs/architecture/adr/) | Architecture Decision Records |
| [`docs/design/design-system.md`](./docs/design/design-system.md) | Token warna, tipografi, spacing |
| [`docs/design/dashboard-spec.md`](./docs/design/dashboard-spec.md) | Spesifikasi UI dashboard |
| [`docs/design/branding.md`](./docs/design/branding.md) | Identitas Super Apps |
| [`docs/guides/getting-started.md`](./docs/guides/getting-started.md) | Setup lokal |
| [`docs/guides/scope-and-exclusions.md`](./docs/guides/scope-and-exclusions.md) | Kriteria inklusi & pengecualian |
| [`docs/guides/project-doc-template.md`](./docs/guides/project-doc-template.md) | Template dokumentasi project |
| [`docs/guides/conventions.md`](./docs/guides/conventions.md) | Penamaan, commit, branch |
| [`docs/guides/maintenance.md`](./docs/guides/maintenance.md) | Rutinitas pemeliharaan katalog |
| [`docs/guides/deploy-vercel.md`](./docs/guides/deploy-vercel.md) | Deploy ke Vercel + catatan privasi |
| [`docs/roadmap.md`](./docs/roadmap.md) | Rencana pengembangan hub |
| [`AGENTS.md`](./AGENTS.md) | Aturan kerja agent AI |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Alur kontribusi |
| [`CHANGELOG.md`](./CHANGELOG.md) | Riwayat versi |

---

## Konvensi

- **Manifest first** — jangan hardcode data project di UI; selalu lewat manifest.
- **`id` = slug kebab-case** dan sama dengan nama file `docs/projects/<id>.md`.
- **`dir`** harus persis sama dengan nama folder di `C:\laragon\www` (studi kasus: folder `AI_LLM_Qur'an_Hadits` punya id `al-hikmah-ai`).
- **Status**: `active` (dikerjakan/dipakai), `maintenance` (hanya perbaikan), `archived` (tidak dikembangkan, disimpan sebagai referensi).
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

---

## Roadmap

Lihat [`docs/roadmap.md`](./docs/roadmap.md). Ringkas:

- [x] Manifest 42 project + dashboard zero-dep
- [x] Dokumentasi arsitektur, design, agent, skill
- [ ] Halaman detail project di dalam dashboard (modal + changelog)
- [ ] Launcher per project (start/stop dev server, docker compose)
- [ ] Aggregate health check (status repo, CI, last commit)
- [ ] Deploy dashboard ke `super.…` sebagai portofolio publik

---

## Lisensi

Kode hub ini: MIT (lihat [`LICENSE`](./LICENSE)).
Setiap project memiliki lisensinya sendiri — lihat `LICENSE` di masing-masing folder.
