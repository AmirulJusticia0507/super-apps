#!/usr/bin/env node
/**
 * Bangun varian publik untuk deploy (Vercel).
 *
 * Mode lokal: tidak melakukan apa pun.
 *   node scripts/build-public.mjs --local
 *   (atau SUPERAPPS_PUBLIC=0)
 *
 * Mode publik (DEFAULT, dipakai Vercel): menyaring data & dokumen yang menyebut
 * repo instansi / pihak ketiga, TANPA mengubah berkas sumber di git.
 *   node scripts/build-public.mjs
 *
 * Default sengaja "publik" agar deploy yang lupa menyetel env var tetap aman:
 * lebih baik menyaring berlebihan daripada membocorkan nama repo instansi.
 *
 * Yang terjadi pada mode publik:
 *   1. projects.manifest.json  → `exclusions.excluded` dikosongkan,
 *      `exclusions.notes` diganti ringkasan jumlah (nama instansi dibuang).
 *   2. README.md               → bagian "Cakupan & Pengecualian" diganti ringkasan.
 *   3. ADR-0003                → tabel contoh nama repo diganti kategori umum.
 *
 * Berkas sumber tetap utuh; hanya hasil deploy yang disaring.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCAL = process.argv.includes("--local") || process.env.SUPERAPPS_PUBLIC === "0";

if (LOCAL) {
  console.log("Mode lokal — tidak ada perubahan.");
  process.exit(0);
}

// ── Pengaman: hanya boleh menulis di folder hasil build ──────────────────
// Skrip ini MENGUBAH berkas di tempat. Di Vercel, build berjalan di salinan
// sementara — aman. Bila dijalankan di repo kerja, itu akan merusak sumber.
// Karena itu kita menolak jalan kecuali berada di salinan build.
const EXPECTED_OUT = join(tmpdir(), "super-apps-build");
const isBuildDir = resolve(ROOT) === resolve(EXPECTED_OUT);

if (!isBuildDir) {
  console.error(
    [
      "✗ Ditolak: build publik hanya boleh berjalan di folder salinan build.",
      `  ROOT terdeteksi : ${ROOT}`,
      `  Diizinkan      : ${EXPECTED_OUT}`,
      "",
      "  Skrip ini memodifikasi berkas di tempat dan akan merusak repo bila",
      "  dijalankan langsung. Gunakan:",
      "    node scripts/simulate-deploy.mjs      # simulasi penuh (aman)",
      "    node scripts/build-public.mjs --local # tidak melakukan apa pun",
    ].join("\n")
  );
  process.exit(2);
}


const changes = [];

/* ── 1. Manifest ─────────────────────────────────────────────────────── */
const manifestPath = join(ROOT, "projects.manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

// Idempoten: build bisa berjalan lebih dari sekali (simulasi & salinan build).
// `excludedCount` disimpan agar tidak hilang saat build kedua.
const excludedCount =
  manifest.exclusions?.excludedCount ??
  manifest.exclusions?.excluded?.length ??
  0;
const notesCount = manifest.exclusions?.notes?.length ?? manifest.exclusions?.excludedCount ?? 0;

manifest.exclusions = {
  policy:
    "A project is included only when it was authored by the owner " +
    "(owner-authored git history) or is an owner-authored local working copy. " +
    "Employer / institutional repositories and external third-party repositories are excluded.",
  excludedCount,
  excluded: [],
  notes: [],
  summary:
    `Katalog ini hanya memuat project milik pemilik akun. ${excludedCount} folder pada workspace ` +
    `sengaja tidak dimasukkan: repo instansi/kedinasan, upstream open source pihak ketiga, ` +
    `serta folder backup/kosong/stub. Rinciannya tidak dipublikasikan.`,
};

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
changes.push(`manifest: excluded ${excludedCount} → 0, notes ${notesCount} → 0`);

/* ── 2. README — ganti bagian cakupan ────────────────────────────────── */
const readmePath = join(ROOT, "README.md");
let readme = await readFile(readmePath, "utf8");

const START = "## Cakupan & Pengecualian";
const END = "## Menambah / Mengubah Project";
const from = readme.indexOf(START);
const to = readme.indexOf(END);

if (from >= 0 && to > from) {
  const replacement = `## Cakupan & Pengecualian

Katalog ini **hanya** memuat project yang benar-benar dibuat sendiri. Kriterianya:

1. Remote repo milik akun pribadi, **atau**
2. Riwayat commit didominasi author sendiri, **atau**
3. Working copy lokal karya sendiri.

${excludedCount} folder lain di workspace sengaja **tidak** dimasukkan — repo instansi/kedinasan,
upstream open source pihak ketiga, serta folder backup, kosong, atau stub. Rinciannya tidak dipublikasikan.

---

`;
  readme = readme.slice(0, from) + replacement + readme.slice(to);
  await writeFile(readmePath, readme, "utf8");
  changes.push("README: bagian cakupan disaring");
} else {
  changes.push("README: bagian cakupan TIDAK ditemukan (dilewati)");
}

/* ── 3. ADR-0003 — saring tabel & prosa ──────────────────────────────── */
const adrPath = join(ROOT, "docs", "architecture", "adr", "0003-ownership-scope.md");
try {
  let adr = await readFile(adrPath, "utf8");
  adr = adr.replace(
    /\| Kelompok \| Keputusan \| Contoh \|[\s\S]*?(?=\n## )/,
    `| Kelompok | Keputusan |
| --- | --- |
| Repo akun pribadi | **Masuk** |
| Repo instansi / kedinasan | Kecuali |
| Repo dengan author campuran pihak lain | Kecuali |
| Upstream open source pihak ketiga | Kecuali |
| Backup / kosong / stub | Kecuali |
| Working copy lokal karya sendiri | **Masuk** |

Jumlah per kelompok tidak dipublikasikan.
`
  );
  adr = adr
    .replace("campuran project personal, repo kantor (Jogjaprov), upstream open-source pihak ketiga,",
             "campuran project personal, repo kantor/instansi, upstream open-source pihak ketiga,")
    .replace("- Sebagian pengalaman kerja profesional (DTSen, Dinsos, JDIH, People GW) tidak tercermin di katalog.",
             "- Sebagian pengalaman kerja profesional di lingkungan instansi tidak tercermin di katalog.");
  await writeFile(adrPath, adr, "utf8");
  changes.push("ADR-0003: tabel & prosa disaring");
} catch {
  changes.push("ADR-0003: tidak ditemukan (dilewati)");
}

/* ── 4. CHANGELOG — saring nama instansi pada catatan rilis ──────────── */
const changelogPath = join(ROOT, "CHANGELOG.md");
try {
  let changelog = await readFile(changelogPath, "utf8");
  changelog = changelog.replace(
    "- Proyek kantor (Jogjaprov/Aptika/Portal Layanan), upstream open source pihak ketiga,",
    "- Proyek kantor/instansi, upstream open source pihak ketiga,"
  );
  await writeFile(changelogPath, changelog, "utf8");
  changes.push("CHANGELOG: nama instansi disaring");
} catch {
  changes.push("CHANGELOG: tidak ditemukan (dilewati)");
}

console.log("Build publik selesai:");
for (const c of changes) console.log(`  - ${c}`);
