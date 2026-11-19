import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "projects.manifest.json");
const API_KEY = process.env.GRIPHUBROUTER_API_KEY || "";
const MODEL = process.env.GRIPHUBROUTER_MODEL || "gpt-6-luna";

if (!API_KEY) {
  console.error("GRIPHUBROUTER_API_KEY missing");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const targets = manifest.apps.filter((a) => !a.security);

console.log(`Target: ${targets.length} project tanpa security`);

for (let i = 0; i < targets.length; i++) {
  const app = targets[i];
  console.log(`\n[${i + 1}/${targets.length}] ${app.id} (${app.dir})`);
  let out;
  try {
    out = execFileSync(process.execPath, [join(ROOT, "scripts", "audit-security-ai.mjs"), app.id, "--json"], {
      env: { ...process.env, GRIPHUBROUTER_API_KEY: API_KEY, GRIPHUBROUTER_MODEL: MODEL },
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 300000,
      windowsHide: true,
    });
  } catch (e) {
    console.error(`  GAGAL: ${String(e.stderr || e.message).slice(0, 500)}`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(out);
  } catch (e) {
    console.error(`  Output bukan JSON: ${String(out).slice(0, 300)}`);
    continue;
  }
  let inner = null;
  try {
    inner = typeof parsed.result === "string" ? JSON.parse(parsed.result) : parsed.result;
  } catch {}
  const findings = Array.isArray(inner?.findings) ? inner.findings : [];
  const status = ["clear", "attention", "critical"].includes(inner?.status) ? inner.status : "attention";
  const summary =
    typeof inner?.summary === "string"
      ? inner.summary
      : typeof parsed.result === "string"
      ? parsed.result.slice(0, 4000)
      : "";

  const target = manifest.apps.find((a) => a.id === app.id);
  target.security = {
    status,
    findings: findings.length,
    reviewed: new Date().toISOString().slice(0, 10),
    summary: summary.slice(0, 4000),
  };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`  OK status=${status} findings=${findings.length}`);
}

console.log("\nSelesai.");
