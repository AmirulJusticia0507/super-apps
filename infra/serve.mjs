#!/usr/bin/env node
/**
 * HTTP server statis zero-dependency untuk Super Apps.
 *
 * Usage:
 *   node infra/serve.mjs [--port 3000] [--host 127.0.0.1] [--root <dir>]
 *
 * Perilaku:
 * - Menyajikan berkas dari direktori kerja saat ini (cwd) secara default.
 *   Ini memungkinkan menjalankan hasil build (mis. folder simulasi deploy)
 *   tanpa mengubah skrip. Pakai `--root` untuk menunjuk folder lain.
 * - `projects.manifest.json` dikirim dengan Cache-Control: no-cache.
 * - Directory listing dimatikan; hanya index.html.
 */
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const SCRIPT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

// cwd dipakai bila mengandung index.html; kalau tidak, jatuh ke root repo.
const CWD = process.cwd();
const ROOT = resolve(
  arg("--root", CWD === SCRIPT_DIR || (await hasIndex(CWD)) ? CWD : SCRIPT_DIR)
);

async function hasIndex(dir) {
  try {
    await stat(join(dir, "index.html"));
    return true;
  } catch {
    return false;
  }
}

const PORT = Number(arg("--port", process.env.PORT || 3000));
const HOST = arg("--host", "127.0.0.1");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const MANIFEST = join(SCRIPT_DIR, "projects.manifest.json");
const STATUS_ENUM = ["clear", "attention", "critical"];
const MODEL_RE = /^[A-Za-z0-9._:-]+$/;
const AUDIT_SCRIPT = join(SCRIPT_DIR, "scripts", "audit-security-ai.mjs");

async function loadManifest() {
  return JSON.parse(await readFile(MANIFEST, "utf8"));
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("Body terlalu besar"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Jalankan audit-security-ai.mjs di server; API key tetap di environment server. */
async function handleAudit(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return sendJSON(res, 400, { ok: false, error: "Body JSON tidak valid." });
  }
  const id = String(payload.id || "");
  const model = String(payload.model || "").trim();
  let manifest;
  try {
    manifest = await loadManifest();
  } catch {
    return sendJSON(res, 500, { ok: false, error: "Manifest tidak dapat dibaca." });
  }
  if (!manifest.apps.some((a) => a.id === id)) {
    return sendJSON(res, 404, { ok: false, error: `Project id tidak dikenal: ${id}` });
  }
  if (!MODEL_RE.test(model)) {
    return sendJSON(res, 400, { ok: false, error: "Model slug tidak valid." });
  }
  if (!process.env.GRIPHUBROUTER_API_KEY) {
    return sendJSON(res, 500, { ok: false, error: "GRIPHUBROUTER_API_KEY tidak ditemukan di environment server." });
  }
  const child = spawn(process.execPath, [AUDIT_SCRIPT, id, "--json"], {
    env: { ...process.env, GRIPHUBROUTER_MODEL: model },
    windowsHide: true,
  });
  let out = "";
  let err = "";
  child.stdout.on("data", (d) => (out += d));
  child.stderr.on("data", (d) => (err += d));
  child.on("error", (e) => sendJSON(res, 500, { ok: false, error: `Gagal menjalankan audit: ${e.message}` }));
  child.on("close", (code) => {
    if (code !== 0) {
      return sendJSON(res, 502, { ok: false, error: (err || "Audit gagal").slice(0, 2000) });
    }
    try {
      const parsed = JSON.parse(out);
      let inner = null;
      try {
        inner = typeof parsed.result === "string" ? JSON.parse(parsed.result) : parsed.result;
      } catch {}
      const findings = Array.isArray(inner?.findings) ? inner.findings : [];
      const status = STATUS_ENUM.includes(inner?.status) ? inner.status : "attention";
      const summary = typeof inner?.summary === "string" ? inner.summary : (typeof parsed.result === "string" ? parsed.result : "");
      sendJSON(res, 200, {
        ok: true,
        id: parsed.id,
        name: parsed.name,
        files: parsed.files,
        status,
        findingsCount: findings.length,
        summary,
        raw: typeof parsed.result === "string" ? parsed.result : JSON.stringify(parsed.result),
      });
    } catch {
      sendJSON(res, 502, { ok: false, error: "Hasil audit bukan JSON valid." });
    }
  });
}

/** Tulis hanya field security ke manifest (divalidasi). */
async function handleSecurity(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return sendJSON(res, 400, { ok: false, error: "Body JSON tidak valid." });
  }
  const id = String(payload.id || "");
  const status = String(payload.status || "");
  const findings = Number(payload.findings);
  const reviewed = String(payload.reviewed || new Date().toISOString().slice(0, 10));
  const summary = String(payload.summary || "");
  let manifest;
  try {
    manifest = await loadManifest();
  } catch {
    return sendJSON(res, 500, { ok: false, error: "Manifest tidak dapat dibaca." });
  }
  const app = manifest.apps.find((a) => a.id === id);
  if (!app) {
    return sendJSON(res, 404, { ok: false, error: `Project id tidak dikenal: ${id}` });
  }
  if (!STATUS_ENUM.includes(status)) {
    return sendJSON(res, 400, { ok: false, error: "Status harus clear|attention|critical." });
  }
  if (!Number.isInteger(findings) || findings < 0) {
    return sendJSON(res, 400, { ok: false, error: "Findings harus bilangan bulat >= 0." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewed)) {
    return sendJSON(res, 400, { ok: false, error: "Tanggal review harus YYYY-MM-DD." });
  }
  app.security = { status, findings, reviewed, summary: summary.slice(0, 4000) };
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  sendJSON(res, 200, { ok: true, id, security: app.security });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/audit") return handleAudit(req, res);
  if (req.method === "POST" && url.pathname === "/api/security") return handleSecurity(req, res);

  const urlPath = decodeURIComponent(url.pathname);
  let filePath = normalize(join(ROOT, urlPath));

  // Cegah path traversal keluar dari ROOT
  if (!filePath.startsWith(ROOT + sep) && filePath !== ROOT) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = join(filePath, "index.html");
      info = await stat(filePath);
    }

    const body = await readFile(filePath);
    const isManifest = filePath.endsWith("projects.manifest.json");

    res.writeHead(200, {
      "Content-Type": TYPES[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": isManifest ? "no-cache" : "public, max-age=3600",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Super Apps → http://${HOST}:${PORT}/`);
  console.log(`Root: ${ROOT}`);
  if (!process.env.GRIPHUBROUTER_API_KEY) {
    console.log("Catatan: GRIPHUBROUTER_API_KEY tidak terdeteksi — tombol 'Jalankan Audit' akan error hingga env diset.");
  }
});
