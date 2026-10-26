#!/usr/bin/env node
/**
 * Audit project yang "stale" (tidak ada commit dalam N hari).
 * Hanya project dengan .git yang bisa dinilai.
 *
 * Usage: node scripts/audit-stale.mjs [--days 180] [--json]
 */
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const DAYS = daysIdx >= 0 ? Number(args[daysIdx + 1]) : 180;
const JSON_OUT = args.includes("--json");

const manifest = JSON.parse(await readFile(join(ROOT, "projects.manifest.json"), "utf8"));
const WORKSPACE = process.env.SUPERAPPS_WORKSPACE || manifest.meta.workspace;

const now = Date.now();
const rows = [];

for (const app of manifest.apps) {
  const abs = join(WORKSPACE, app.dir);
  try {
    const { stdout } = await exec("git", ["-C", abs, "log", "-1", "--format=%cI|%h|%s"], { windowsHide: true });
    const [iso, hash, subject] = stdout.trim().split("|");
    const ageDays = Math.floor((now - new Date(iso).getTime()) / 86400000);
    rows.push({ id: app.id, dir: app.dir, ageDays, hash, subject, stale: ageDays > DAYS });
  } catch {
    rows.push({ id: app.id, dir: app.dir, ageDays: null, hash: "", subject: "no git history", stale: null });
  }
}

rows.sort((a, b) => (b.ageDays ?? 99999) - (a.ageDays ?? 99999));

if (JSON_OUT) {
  console.log(JSON.stringify({ days: DAYS, generatedAt: new Date().toISOString(), rows }, null, 2));
} else {
  const width = Math.max(...rows.map((r) => r.dir.length));
  for (const r of rows) {
    const age = r.ageDays === null ? "  n/a" : `${String(r.ageDays).padStart(5)}d`;
    const flag = r.stale === true ? "STALE" : r.stale === null ? "  —  " : " ok  ";
    console.log(`${flag} ${age}  ${r.dir.padEnd(width)}  ${r.hash} ${r.subject.slice(0, 60)}`);
  }
  const stale = rows.filter((r) => r.stale);
  console.log(`\nThreshold ${DAYS} hari · ${stale.length} stale dari ${rows.length} project (dengan git: ${rows.filter((r) => r.ageDays !== null).length})`);
}
