#!/usr/bin/env node
/**
 * Cek path project di workspace.
 * Memastikan setiap `dir` adalah folder nyata, non-kosong, dan melaporkan
 * metadata ringan (jumlah file top-level, ada/tidak .git, remote).
 *
 * Usage: node scripts/check-paths.mjs [--json]
 */
import { readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = process.argv.includes("--json");
const manifest = JSON.parse(await readFileText(join(ROOT, "projects.manifest.json")));
const WORKSPACE = process.env.SUPERAPPS_WORKSPACE || manifest.meta.workspace || "C:/laragon/www";

function readFileText(p) {
  return import("node:fs/promises").then((fs) => fs.readFile(p, "utf8"));
}

const rows = [];
for (const app of manifest.apps) {
  const abs = join(WORKSPACE, app.dir);
  let entries = 0;
  let ok = true;
  let hasGit = false;
  let remote = "";
  try {
    const s = await stat(abs);
    if (!s.isDirectory()) {
      ok = false;
    } else {
      entries = (await readdir(abs)).length;
      try {
        await stat(join(abs, ".git"));
        hasGit = true;
        const { stdout } = await exec("git", ["-C", abs, "remote", "get-url", "origin"], { windowsHide: true });
        remote = stdout.trim();
      } catch {
        hasGit = false;
      }
    }
  } catch {
    ok = false;
  }
  rows.push({ id: app.id, dir: app.dir, ok, entries, hasGit, remote });
}

if (JSON_OUT) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const width = Math.max(...rows.map((r) => r.dir.length));
  for (const r of rows) {
    const mark = r.ok ? (r.entries > 0 ? "✓" : "!") : "✗";
    const git = r.hasGit ? (r.remote ? "git+remote" : "git") : "no-git";
    console.log(`${mark} ${r.dir.padEnd(width)}  ${String(r.entries).padStart(3)} item  ${git}`);
  }
  const missing = rows.filter((r) => !r.ok);
  const empty = rows.filter((r) => r.ok && r.entries === 0);
  console.log(`\n${rows.length} project · ${rows.length - missing.length} ditemukan · ${missing.length} hilang · ${empty.length} kosong`);
  if (missing.length) process.exit(1);
}
