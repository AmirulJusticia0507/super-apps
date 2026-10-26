#!/usr/bin/env node
/**
 * Cek tautan relatif di seluruh Markdown hub.
 * Memastikan setiap [teks](path) yang menunjuk file lokal benar-benar ada.
 * Tautan eksternal (http/https/mailto) dan anchor (#) dilewati.
 *
 * Usage: node scripts/check-links.mjs [--verbose]
 */
import { readdir, readFile, access, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERBOSE = process.argv.includes("--verbose");

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.name.toLowerCase().endsWith(".md")) out.push(full);
  }
  return out;
}

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const files = await walk(ROOT);
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const broken = [];
let checked = 0;

for (const file of files) {
  const text = await readFile(file, "utf8");
  // Buang blok kode agar contoh tidak dianggap tautan.
  const clean = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const match of clean.matchAll(LINK_RE)) {
    const raw = match[1];
    if (/^(https?:|mailto:|#|tel:)/i.test(raw)) continue;
    const target = raw.split("#")[0];
    if (!target) continue;
    checked++;
    const abs = resolve(dirname(file), decodeURIComponent(target));
    if (!(await exists(abs))) {
      broken.push({ file: file.slice(ROOT.length + 1).replace(/\\/g, "/"), link: raw });
    }
  }
}

if (VERBOSE) console.log(`File Markdown: ${files.length} · tautan lokal diperiksa: ${checked}`);

if (broken.length) {
  console.log(`\n✗ ${broken.length} tautan rusak:`);
  for (const b of broken) console.log(`  ${b.file} → ${b.link}`);
  process.exit(1);
}
console.log(`✓ Semua tautan lokal valid (${checked} diperiksa pada ${files.length} file).`);
