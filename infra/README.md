# Infrastruktur Super Apps

Hub ini **tidak memerlukan** infrastruktur — ia hanya file statis + skrip Node. Folder ini berisi konfigurasi opsional untuk menjalankannya dengan cara yang lebih terstruktur.

## Isi

| File | Fungsi |
| --- | --- |
| `serve.mjs` | HTTP server zero-dependency (pengganti `npx serve` / `python -m http.server`) + endpoint audit lokal |
| `nginx.conf.example` | Contoh virtual host Nginx untuk menyajikan hub |
| `docker-compose.yml` | Opsional: jalankan lewat container Nginx |
| `laragon-vhost.md` | Cara memasang hub di Laragon |

## Menjalankan

### Node (direkomendasikan)

```bash
node infra/serve.mjs                  # http://127.0.0.1:3000
node infra/serve.mjs --port 8811      # http://127.0.0.1:8811
```

Tombol **Jalankan Audit** di halaman audit memanggil endpoint ini. Pastikan
`GRIPHUBROUTER_API_KEY` (dan opsional `GRIPHUBROUTER_MODEL`) ada di environment
sebelum server dijalankan — kunci **tidak pernah dikirim ke browser**, hanya dibaca
di sisi server untuk menjalankan `scripts/audit-security-ai.mjs`.

### Nginx (produksi)

Salin `nginx.conf.example` ke konfigurasi Nginx, sesuaikan `root`.

### Docker

```bash
docker compose -f infra/docker-compose.yml up -d
```

## Endpoint (hanya saat server lokal dijalankan)

| Method | Path | Fungsi |
| --- | --- | --- |
| `POST` | `/api/audit` | Body `{id, model}`. Menjalankan audit AI di server, mengembalikan `{status, findingsCount, summary, raw}`. |
| `POST` | `/api/security` | Body `{id, status, findings, reviewed, summary}`. Menulis **hanya** field `security` ke `projects.manifest.json` (divalidasi). |

Kedua endpoint memvalidasi `id` terhadap manifest dan menolak slug model/status tidak sah.

## Prinsip

1. **Tanpa state** — tidak ada database atau cache; `projects.manifest.json` dikirim `no-cache`.
2. **Penulisan terbatas** — hanya `/api/security` yang menulis file, dan hanya field `security` pada app yang diberikan `id`; tidak ada upload bebas.
3. **Bisa dicache agresif** — kecuali `projects.manifest.json`.

## Keamanan

| Aspek | Catatan |
| --- | --- |
| Autentikasi | Tidak ada — katalog bersifat publik; server audit hanya untuk lokal/dev |
| API key | `GRIPHUBROUTER_API_KEY` dibaca dari environment **server**, tidak pernah ke browser |
| Data sensitif | Tidak boleh ada; audit sebelum deploy publik |
| CORS | Tidak diperlukan (satu origin) |
| Directory listing | Harus dimatikan di Nginx |
| Source map | Tidak ada build, jadi tidak relevan |

Sebelum mempublikasikan hub ke internet, baca checklist di
[`docs/design/branding.md`](../docs/design/branding.md) dan
[`docs/guides/scope-and-exclusions.md`](../docs/guides/scope-and-exclusions.md).
