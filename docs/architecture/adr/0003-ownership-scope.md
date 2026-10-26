# ADR-0003 — Ruang lingkup: hanya project milik sendiri

- **Status**: Diterima
- **Tanggal**: 2026-10-26
- **Konteks**: Penentuan isi katalog

## Konteks

Workspace `C:\laragon\www` berisi 84 entri: campuran project personal, repo kantor (Jogjaprov), upstream open-source pihak ketiga, backup situs, dan direktori kosong. Super Apps adalah representasi *portofolio personal* — memasukkan milik orang lain akan menyesatkan.

## Keputusan

Project masuk katalog **hanya jika** salah satu benar:

1. Remote origin berada di akun pribadi `github.com/AmirulJusticia0507`.
2. Riwayat git didominasi author milik sendiri: `amirulputra0507`, `AmirulJusticia0507`, `amirulpj`, `amirul.justicia0507`.
3. Working copy lokal tanpa git yang terbukti karya sendiri dan belum tergantikan.

Jika gagal ketiganya → masuk `exclusions`.

## Metode Verifikasi

Kriteria dievaluasi dari data nyata, bukan asumsi:

```bash
# remote
git -C <dir> remote get-url origin

# author history
git -C <dir> log --format='%an <%ae>' -n 400 | sort -u
```

## Hasil

| Kelompok | Keputusan | Contoh |
| --- | --- | --- |
| Repo pribadi GitHub | **Masuk** (39) | lex-integrity, presensi-go, kebun-tebu |
| Repo kantor Jogjaprov | Kecuali | be-layanan, portal-web, dtsen-manager-* |
| Repo kantor dengan author campuran | Kecuali | sarpras-fe, fe-publik-manunggalraharja-dtks, rest-apis |
| Upstream open source | Kecuali | odysseus, OmniRoute, WhatsApp-OSINT, getcontact-cli |
| Backup / kosong / stub | Kecuali | 260210_biropiwpp_backup, be_dinsos_manunggalr, ai-service |
| Lokal tanpa git (karya sendiri) | **Masuk** (3) | presensi-go-mobile, e-lawver (varian e-lawyer) |
| Mockup yang tergantikan | Kecuali | manunggal-raharja |

## Konsekuensi

**Positif**
- Katalog jujur secara atribusi.
- Tidak ada risiko mempublikasikan kode internal instansi.

**Negatif**
- Sebagian pengalaman kerja profesional (DTSen, Dinsos, JDIH, People GW) tidak tercermin di katalog.
- Perlu penjelasan manual (`exclusions.notes`) agar keputusan bisa diaudit ulang.

## Tindak Lanjut

- Daftar eksklusi + alasan hidup di manifest (`exclusions.notes`).
- Panduan lengkap: [`../../guides/scope-and-exclusions.md`](../../guides/scope-and-exclusions.md).
- Jika status kepemilikan berubah (mis. repo kantor di-open-source-kan dengan izin), pindahkan ke `apps[]` dan hapus dari `excluded`.
