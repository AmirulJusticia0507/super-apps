# Infrastruktur Super Apps

Hub ini **tidak memerlukan** infrastruktur — ia hanya file statis + skrip Node. Folder ini berisi konfigurasi opsional untuk menjalankannya dengan cara yang lebih terstruktur.

## Isi

| File | Fungsi |
| --- | --- |
| `serve.mjs` | HTTP server zero-dependency (pengganti `npx serve` / `python -m http.server`) |
| `nginx.conf.example` | Contoh virtual host Nginx untuk menyajikan hub |
| `docker-compose.yml` | Opsional: jalankan lewat container Nginx |
| `laragon-vhost.md` | Cara memasang hub di Laragon |

## Menjalankan

### Node (direkomendasikan)

```bash
node infra/serve.mjs            # http://localhost:3000
node infra/serve.mjs --port 8811
```

### Nginx (produksi)

Salin `nginx.conf.example` ke konfigurasi Nginx, sesuaikan `root`.

### Docker

```bash
docker compose -f infra/docker-compose.yml up -d
```

## Prinsip

1. **Tanpa state** — hanya file statis; tidak ada database atau cache.
2. **Tanpa penulisan** — server tidak pernah menerima upload atau menulis file.
3. **Bisa dicache agresif** — kecuali `projects.manifest.json` (perlu `no-cache` agar perubahan langsung terlihat).

## Keamanan

| Aspek | Catatan |
| --- | --- |
| Autentikasi | Tidak ada — katalog bersifat publik |
| Data sensitif | Tidak boleh ada; audit sebelum deploy publik |
| CORS | Tidak diperlukan (satu origin) |
| Directory listing | Harus dimatikan di Nginx |
| Source map | Tidak ada build, jadi tidak relevan |

Sebelum mempublikasikan hub ke internet, baca checklist di
[`docs/design/branding.md`](../docs/design/branding.md) dan
[`docs/guides/scope-and-exclusions.md`](../docs/guides/scope-and-exclusions.md).
