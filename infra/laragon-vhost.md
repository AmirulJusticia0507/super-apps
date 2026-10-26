# Super Apps di Laragon

Panduan memasang hub pada Laragon (lingkungan kerja utama di `C:\laragon\www`).

## Opsi A — Tanpa konfigurasi (paling cepat)

Karena folder `super-apps` berada langsung di bawah `C:\laragon\www`, Laragon sudah menyajikannya otomatis:

```
http://localhost/super-apps/
```

Pastikan Laragon **Start All** dan Apache/Nginx aktif.

## Opsi B — Pretty URL (virtual host)

Ingin `http://super-apps.test/` alih-alih path?

1. **Laragon → Menu → Apache → sites-enabled**, atau buka **Preferences → Services & Ports**.
2. Tambah host baru:
   - **Name**: `super-apps`
   - **Document Root**: `C:\laragon\www\super-apps`
3. Klik **Start**.

Laragon menulis vhost yang setara dengan `infra/nginx.conf.example`.

## Opsi C — Server Node bawaan

Bila Apache/Nginx tidak ingin dijalankan:

```powershell
cd C:\laragon\www\super-apps
node infra/serve.mjs --port 8811
```

Buka `http://localhost:8811/`.

## Checklist Pemasangan

- [ ] `http://localhost/super-apps/` mengembalikan 200
- [ ] Dashboard menampilkan 42 kartu
- [ ] Console browser bersih
- [ ] `http://localhost/super-apps/projects.manifest.json` menampilkan JSON
- [ ] Perubahan manifest langsung terlihat setelah reload (Ctrl+Shift+R)

## Masalah Umum di Laragon

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| 404 `/super-apps/` | Folder salah lokasi | Harus tepat di `C:\laragon\www\super-apps` |
| JSON tampil sebagai download | MIME type salah | Opsi A/B memakai MIME bawaan; jika custom, tambah `AddType application/json .json` |
| Perubahan tidak terlihat | Cache browser | Ctrl+Shift+R |
| Port 80 dipakai | Skala/Apache lain | Ganti port di menu Laragon |
| Manifest "gagal dimuat" | Dibuka via `file://` | Pakai URL `http://…` |

## Catatan Multi-Project

Hub hanya membaca **metadata** project lain. Saat mengklik *Path* pada kartu, hub menyalin
`C:\laragon\www\<dir>` ke clipboard — Anda tetap pindah folder secara manual atau lewat terminal.

Proyek lain di `C:\laragon\www` tetap dapat diakses pada path masing-masing
(mis. `http://localhost/sitani_DIY/`) sesuai konfigurasi Laragon masing-masing.
