#!/usr/bin/env node
/** Audit dependency dan konfigurasi project melalui API chat-completions kompatibel OpenAI. */
import { readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const id = args.find((arg) => !arg.startsWith("--"));
const dryRun = args.includes("--dry-run");
const jsonOut = args.includes("--json");
const manifest = JSON.parse(await readFile(join(ROOT, "projects.manifest.json"), "utf8"));
const app = manifest.apps.find((item) => item.id === id);
const candidates = ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "requirements.txt", "poetry.lock", "Pipfile.lock", "composer.json", "composer.lock", "go.mod", "go.sum", "pom.xml", "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "README.md"];
const exec = promisify(execFile);

async function userEnvironment(name) {
  if (process.platform !== "win32") return "";
  try {
    const { stdout } = await exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `[Environment]::GetEnvironmentVariable('${name}', 'User')`], { windowsHide: true });
    return stdout.trim();
  } catch {
    return "";
  }
}

if (!id || !app) {
  console.error("Usage: node scripts/audit-security-ai.mjs <project-id> [--dry-run] [--json]");
  process.exit(1);
}

const project = join(manifest.meta.workspace, app.dir);
const roots = [project];
if (app.entry && !app.entry.includes(".")) roots.push(join(project, app.entry));
const files = [];
for (const base of roots) {
  for (const name of candidates) {
    const path = join(base, name);
    try {
      if ((await stat(path)).isFile()) files.push(path);
    } catch {}
  }
}
const uniqueFiles = [...new Set(files)];
const report = { id: app.id, name: app.name, files: uniqueFiles.map((path) => path.slice(project.length + 1)) };

if (dryRun) {
  console.log(jsonOut ? JSON.stringify(report, null, 2) : `Audit AI ${app.name}\nBerkas yang akan dikirim:\n${report.files.map((file) => `- ${file}`).join("\n") || "- Tidak ada berkas kandidat"}`);
  process.exit(0);
}

const apiKey = process.env.GRIPHUBROUTER_API_KEY || await userEnvironment("GRIPHUBROUTER_API_KEY");
const model = process.env.GRIPHUBROUTER_MODEL || await userEnvironment("GRIPHUBROUTER_MODEL");
if (!apiKey || !model) {
  console.error("Set GRIPHUBROUTER_API_KEY dan GRIPHUBROUTER_MODEL, atau gunakan --dry-run untuk memeriksa berkas.");
  process.exit(1);
}
if (!uniqueFiles.length) {
  console.error(`Tidak ada berkas dependency atau konfigurasi yang dapat diaudit pada ${app.dir}.`);
  process.exit(1);
}

const MAX_FILE_BYTES = 24_000;
const contexts = await Promise.all(uniqueFiles.map(async (path) => ({
  path: path.slice(project.length + 1),
  content: (await readFile(path, "utf8")).slice(0, MAX_FILE_BYTES),
})));
const prompt = `Audit keamanan statis untuk project berikut. Jangan menyatakan project aman; laporkan hanya risiko yang didukung konteks. Fokus pada dependency rentan, konfigurasi tidak aman, secrets yang tampak, dan risiko deployment. Beri JSON valid dengan status (clear|attention|critical), findings (array), dan summary.\n\nProject: ${JSON.stringify({ id: app.id, name: app.name, stack: app.stack })}\n\nBerkas:\n${contexts.map((file) => `--- ${file.path}\n${file.content}`).join("\n\n")}`;
const response = await fetch("https://griphubrouter.web.id/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0 }),
});
if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
const data = await response.json();
const content = data.choices?.[0]?.message?.content;
if (!content) throw new Error("Respons API tidak memuat hasil audit.");
console.log(jsonOut ? JSON.stringify({ ...report, result: content }, null, 2) : content);
