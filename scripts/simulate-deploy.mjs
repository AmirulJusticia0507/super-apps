#!/usr/bin/env node
/**
 * Simulasi lokal pipeline deploy Vercel Super Apps.
 *
 * Menyalin repo ke folder temp dengan aturan .vercelignore, menjalankan
 * buildCommand dari vercel.json, lalu mengaudit hasilnya:
 *   1. Dashboard tetap merender semua project (cek jumlah app di manifest).
 *   2. Tidak ada nama repo instansi / pihak ketiga yang tersisa.
 *   3. Berkas yang dibutuhkan dashboard ada.
 *
 * Usage: node scripts/simulate-deploy.mjs [--keep]
 */
import { readFile, cp, rm, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEEP = process.argv.includes("--keep");
const OUT = join(tmpdir(), "super-apps-deploy-sim");

/** Daftar kata yang menandakan kebocoran nama repo instansi / pihak ketiga. */
const FORBIDDEN = [
  "jogjaprov", "aptika", "dtsen", "manunggal", "dinsos", "jogjis", "baperida",
  "abhipraya", "peladen", "people-gw", "people-service", "portal-web",
  "portal-dinsos", "sireda", "jdih-fe", "sarpras", "rest-apis", "bruno",
  "biropiwpp", "dash-people", "dianghazy", "putraaditya",
];

function parseGitignore(text) {
  const dirs = [];
  const files = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("!")) continue;
    const clean = line.replace(/^\//, "").replace(/\/$/, "");
    const isGlob = clean.includes("*");
    if (isGlob) continue;
    if (line.endsWith("/")) dirs.push(clean);
    else files.push(clean);
  }
  return { dirs, files };
}

const ignore = parseGitignore(await readFile(join(ROOT, ".vercelignore"), "utf8"));

async function copyFiltered(src, dest, rel = "") {
  for (const entry of await readdir(src, { withFileTypes: true })) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.name === ".git") continue;
    if (ignore.dirs.some((d) => childRel === d || childRel.startsWith(d + "/"))) continue;
    if (ignore.files.some((f) => childRel === f || entry.name === f)) continue;
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      await cp(s, d, { recursive: true, filter: () => true }).catch(() => {});
      // cp menyalin penuh; pindai ulang agar aturan nested tetap berlaku
      await rm(d, { recursive: true, force: true });
      await cp(s, d, {
        recursive: true,
        filter: (p) => {
          const r = relative(src, p).replace(/\\/g, "/");
          if (!r || r === ".") return true;
          const full = `${rel}/${r}`;
          if (ignore.dirs.some((x) => full === x || full.startsWith(x + "/"))) return false;
          if (ignore.files.some((x) => full === x)) return false;
          return true;
        },
      });
    } else {
      await cp(s, d);
    }
  }
}

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

/* ── 1. Salin sesuai .vercelignore ───────────────────────────────────── */
await rm(OUT, { recursive: true, force: true });
await cp(ROOT, OUT, {
  recursive: true,
  filter: (p) => {
    const r = relative(ROOT, p).replace(/\\/g, "/");
    if (!r) return true;
    if (r === ".git" || r.startsWith(".git/")) return false;
    if (r === ".vercel" || r.startsWith(".vercel/")) return false;
    if (ignore.dirs.some((d) => r === d || r.startsWith(d + "/"))) return false;
    if (ignore.files.some((f) => r === f)) return false;
    return true;
  },
});

/* ── 2. Jalankan buildCommand dari vercel.json ───────────────────────── */
// build-public.mjs menolak menulis di luar folder build-nya, jadi kita
// menirukan perilaku Vercel: salin hasil saring ke folder build terpisah.
const vercelJson = JSON.parse(await readFile(join(OUT, "vercel.json"), "utf8"));
const build = vercelJson.buildCommand;
const [cmd, ...cliArgs] = build.split(" ");
const BUILD_OUT = join(tmpdir(), "super-apps-build");
await rm(BUILD_OUT, { recursive: true, force: true });
await cp(OUT, BUILD_OUT, { recursive: true });
const { stdout } = await exec(cmd, cliArgs, {
  cwd: BUILD_OUT,
  env: { ...process.env },
  windowsHide: true,
});
// Sajikan & audit dari folder build (itulah yang di-deploy).
await rm(OUT, { recursive: true, force: true });
await cp(BUILD_OUT, OUT, { recursive: true });

/* ── 3. Audit ─────────────────────────────────────────────────────────── */
const report = { buildOutput: stdout.trim().split(/\r?\n/), errors: [], warnings: [] };

const manifest = JSON.parse(await readFile(join(OUT, "projects.manifest.json"), "utf8"));
report.apps = manifest.apps.length;
if (report.apps !== 42) report.errors.push(`manifest publik memuat ${report.apps} app (harus 42)`);
if ((manifest.exclusions?.excluded ?? []).length !== 0) report.errors.push("exclusions.excluded tidak kosong");
if ((manifest.exclusions?.notes ?? []).length !== 0) report.errors.push("exclusions.notes tidak kosong");

for (const f of ["index.html", "app.js", "projects.manifest.json"]) {
  try {
    await stat(join(OUT, f));
  } catch {
    report.errors.push(`berkas wajib hilang: ${f}`);
  }
}

const files = await walk(OUT);
const textual = files.filter((f) => /\.(md|json|js|html|txt|yml|example)$/i.test(f));
report.files = files.length;
report.scanned = textual.length;

for (const file of textual) {
  const text = (await readFile(file, "utf8")).toLowerCase();
  for (const word of FORBIDDEN) {
    if (text.includes(word)) {
      report.errors.push(`kebocoran "${word}" di ${relative(OUT, file).replace(/\\/g, "/")}`);
    }
  }
}

const leaked = report.errors.filter((e) => e.startsWith("kebocoran")).length;
console.log(`Output build:\n${report.buildOutput.map((l) => `  ${l}`).join("\n")}`);
console.log(`\nBerkas terunggah: ${report.files} · dipindai: ${report.scanned}`);
console.log(`Apps di manifest publik: ${report.apps}`);
console.log(`Kebocoran nama repo: ${leaked}`);

if (report.errors.length) {
  console.error("\n✗ Gagal:");
  for (const e of report.errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\n✓ Simulasi deploy lulus: dashboard utuh, tidak ada nama repo instansi yang terpublikasi.");
if (!KEEP) await rm(OUT, { recursive: true, force: true });
else console.log(`Folder simulasi dipertahankan: ${OUT}`);
