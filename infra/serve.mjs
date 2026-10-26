#!/usr/bin/env node
/**
 * HTTP server statis zero-dependency untuk Super Apps.
 *
 * Usage:
 *   node infra/serve.mjs [--port 3000] [--host 127.0.0.1]
 *
 * Perilaku:
 * - Menyajikan semua file dari root repo (satu level di atas infra/).
 * - `projects.manifest.json` dikirim dengan Cache-Control: no-cache.
 * - Directory listing dimatikan; hanya index.html.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

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

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
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
    const name = filePath.slice(ROOT.length + 1).replace(/\\/g, "/");
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
});
