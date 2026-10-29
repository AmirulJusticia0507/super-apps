#!/usr/bin/env node
/**
 * Validasi projects.manifest.json
 * - field wajib & tipe
 * - id unik + kebab-case
 * - category harus ada di categories[]
 * - status valid
 * - file docs yang dideklarasikan harus ada (relatif ke project dir)
 * - file docs/projects/<id>.md harus ada
 *
 * Usage: node scripts/validate-manifest.mjs [--strict]
 */
import { readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "projects.manifest.json");
const WORKSPACE = "C:/laragon/www";
const STRICT = process.argv.includes("--strict");

const REQUIRED = ["id", "dir", "name", "tagline", "category", "status", "stack"];
const STATUSES = ["active", "maintenance", "archived"];
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));

if (!manifest.meta) fail("meta wajib ada");
if (!Array.isArray(manifest.categories) || !manifest.categories.length) fail("categories harus array non-kosong");
if (!Array.isArray(manifest.apps)) fail("apps harus array");

const catIds = new Set((manifest.categories ?? []).map((c) => c.id));
const seen = new Map();

for (const [i, app] of (manifest.apps ?? []).entries()) {
  const where = `apps[${i}]${app?.id ? ` (${app.id})` : ""}`;

  for (const key of REQUIRED) {
    if (app[key] === undefined || app[key] === null || app[key] === "") fail(`${where}: field wajib "${key}" kosong`);
  }

  if (app.id && !KEBAB.test(app.id)) fail(`${where}: id bukan kebab-case`);
  if (app.id && seen.has(app.id)) fail(`${where}: id duplikat dengan apps[${seen.get(app.id)}]`);
  if (app.id) seen.set(app.id, i);

  if (app.category && !catIds.has(app.category)) fail(`${where}: category "${app.category}" tidak ada di categories[]`);
  if (app.status && !STATUSES.includes(app.status)) fail(`${where}: status "${app.status}" bukan salah satu ${STATUSES.join("/")}`);

  if (app.stack && (!Array.isArray(app.stack) || app.stack.length === 0)) warn(`${where}: stack kosong`);
  if (app.tags && !Array.isArray(app.tags)) fail(`${where}: tags harus array`);
  if (app.url !== undefined && (typeof app.url !== "string" || !/^https?:\/\/[^\s]+$/.test(app.url))) {
    fail(`${where}: url harus URL http(s) yang valid`);
  }
  if (app.docs && !Array.isArray(app.docs)) fail(`${where}: docs harus array`);
  if (app.progress !== undefined && (!Number.isInteger(app.progress) || app.progress < 0 || app.progress > 100)) {
    fail(`${where}: progress harus bilangan bulat 0–100`);
  }
  if (app.security !== undefined) {
    if (!app.security || typeof app.security !== "object" || Array.isArray(app.security)) fail(`${where}: security harus object`);
    else {
      if (!["clear", "attention", "critical"].includes(app.security.status)) fail(`${where}: security.status harus clear/attention/critical`);
      if (!Number.isInteger(app.security.findings) || app.security.findings < 0) fail(`${where}: security.findings harus bilangan bulat ≥ 0`);
      if (app.security.reviewed !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(app.security.reviewed)) fail(`${where}: security.reviewed harus YYYY-MM-DD`);
      if (app.security.summary !== undefined && typeof app.security.summary !== "string") fail(`${where}: security.summary harus string`);
    }
  }

  if (app.dir && !(await exists(join(WORKSPACE, app.dir)))) warn(`${where}: folder ${WORKSPACE}/${app.dir} tidak ditemukan`);

  for (const doc of app.docs ?? []) {
    if (app.dir && !(await exists(join(WORKSPACE, app.dir, doc)))) warn(`${where}: docs "${doc}" tidak ditemukan di folder project`);
  }

  if (app.id && !(await exists(join(ROOT, "docs", "projects", `${app.id}.md`)))) {
    (STRICT ? fail : warn)(`${where}: docs/projects/${app.id}.md belum ada`);
  }
}

const declared = (manifest.exclusions?.excluded ?? []).filter(Boolean);
for (const dir of declared) {
  if (!(await exists(join(WORKSPACE, dir)))) warn(`exclusions: "${dir}" tidak ada di workspace (mungkin sudah dihapus/dipindah)`);
}
for (const app of manifest.apps ?? []) {
  if (declared.includes(app.dir)) fail(`"${app.dir}" muncul di apps[] sekaligus di exclusions[]`);
}

const report = (label, list, out) => {
  if (!list.length) return;
  out(label === "ERROR" ? `\n${label} (${list.length})` : `\n${label} (${list.length})`);
  for (const m of list) out(`  - ${m}`);
};

let buffer = `Manifest: ${manifest.meta?.name} v${manifest.meta?.version} · ${(manifest.apps ?? []).length} apps · ${catIds.size} kategori`;
const out = (label) => (buffer += `\n${label}`);
report("ERROR", errors, out);
report("WARN", warnings, out);
console.log(buffer);

if (errors.length) {
  console.error(`\n✗ Validasi gagal: ${errors.length} error, ${warnings.length} warning.`);
  process.exit(1);
}
console.log(`\n✓ Valid${warnings.length ? ` dengan ${warnings.length} warning.` : "."}`);
