#!/usr/bin/env node
/**
 * Buat skeleton dokumentasi project: docs/projects/<id>.md
 * Data diambil dari manifest; bagian yang tak diketahui ditandai TODO.
 *
 * Usage: node scripts/new-project-doc.mjs <id> [--force]
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [id] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const FORCE = process.argv.includes("--force");

if (!id) {
  console.error("Usage: node scripts/new-project-doc.mjs <id> [--force]");
  process.exit(1);
}

const manifest = JSON.parse(await readFile(join(ROOT, "projects.manifest.json"), "utf8"));
const app = manifest.apps.find((a) => a.id === id);
if (!app) {
  console.error(`Project "${id}" tidak ada di manifest. Tambahkan dulu ke apps[].`);
  process.exit(1);
}

const cat = manifest.categories.find((c) => c.id === app.category);
const target = join(ROOT, "docs", "projects", `${id}.md`);
try {
  await access(target);
  if (!FORCE) {
    console.error(`${target} sudah ada. Gunakan --force untuk menimpa.`);
    process.exit(1);
  }
} catch {
  /* belum ada */
}

const body = `# ${app.name}

> ${app.tagline}

| | |
| --- | --- |
| **ID** | \`${app.id}\` |
| **Folder** | \`${manifest.meta.workspace}/${app.dir}\` |
| **Kategori** | ${cat ? `${cat.name} (\`${cat.id}\`)` : app.category} |
| **Status** | \`${app.status}\` |
| **Entry point** | \`${app.entry || "TODO"}\` |
| **Repository** | ${app.repo ? `<${app.repo}>` : "_(lokal, tanpa remote)_"} |
| **Stack** | ${(app.stack || []).join(", ") || "TODO"} |
| **Tags** | ${(app.tags || []).map((t) => `\`${t}\``).join(", ") || "—"} |

## Ringkasan

TODO: jelaskan produk ini dalam 2–3 paragraf — masalah yang dipecahkan, pengguna, dan nilai utamanya.

## Fitur Utama

- TODO
- TODO
- TODO

## Arsitektur

Ringkas lapisan sistem (frontend, backend, data, layanan eksternal). Untuk diagram, gunakan blok \`mermaid\`.

\`\`\`mermaid
flowchart LR
  U[User] --> FE[Frontend]
  FE --> BE[Backend]
  BE --> DB[(Database)]
\`\`\`

## Menjalankan Lokal

\`\`\`bash
cd ${manifest.meta.workspace}/${app.dir}
# TODO: perintah install & run
\`\`\`

Prasyarat: TODO (runtime, versi, database, env vars).

## Konfigurasi Environment

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| TODO | ya | TODO |

## Dokumentasi Internal Project

${(app.docs || []).map((d) => `- \`${d}\``).join("\n") || "- _(tidak ada)_"}

## Status & Catatan Pemeliharaan

- Terakhir diaudit: 2026-10-26
- Status: \`${app.status}\`
- TODO: risiko teknis, utang teknis, rencana berikutnya.

## Riwayat

| Tanggal | Perubahan |
| --- | --- |
| 2026-10-26 | Halaman dokumentasi dibuat dari manifest. |
`;

await writeFile(target, body, "utf8");
console.log(`✓ Dibuat: ${target}`);
