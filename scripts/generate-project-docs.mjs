#!/usr/bin/env node
/**
 * Generate docs/projects/<id>.md untuk SEMUA project di manifest.
 * Idempoten: file yang sudah ada tidak ditimpa kecuali --force.
 *
 * Usage: node scripts/generate-project-docs.mjs [--force]
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORCE = process.argv.includes("--force");
const manifest = JSON.parse(await readFile(join(ROOT, "projects.manifest.json"), "utf8"));
const WS = manifest.meta.workspace;

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

let created = 0;
let skipped = 0;

for (const app of manifest.apps) {
  const cat = manifest.categories.find((c) => c.id === app.category);
  const target = join(ROOT, "docs", "projects", `${app.id}.md`);
  if (!FORCE && (await exists(target))) {
    skipped++;
    continue;
  }
  const body = `# ${app.name}

> ${app.tagline}

| | |
| --- | --- |
| **ID** | \`${app.id}\` |
| **Folder** | \`${WS}/${app.dir}\` |
| **Kategori** | ${cat ? `${cat.name} (\`${cat.id}\`)` : app.category} |
| **Status** | \`${app.status}\` |
| **Entry point** | \`${app.entry || "—"}\` |
| **Repository** | ${app.repo ? `<${app.repo}>` : "_(lokal, tanpa remote)_"} |
| **Stack** | ${(app.stack || []).join(", ")} |
| **Tags** | ${(app.tags || []).map((t) => `\`${t}\``).join(", ") || "—"} |

## Ringkasan

${app.tagline}. Proyek ini berada di workspace lokal \`${WS}/${app.dir}\` dan dibuka melalui
dashboard Super Apps (kartu **${app.name}** pada kategori ${cat?.name || app.category}).

## Cara Menjalankan

\`\`\`bash
cd ${WS}/${app.dir}
\`\`\`

Entry point utama: \`${app.entry || "lihat README project"}\`.
Ikuti instruksi instalasi di README project untuk prasyarat runtime, database, dan environment variable.

## Dokumentasi Internal Project

${(app.docs || []).map((d) => `- \`${d}\``).join("\n") || "- _(tidak ada)_"}

## Stack

${(app.stack || []).map((s) => `- ${s}`).join("\n")}

## Catatan

- Status \`${app.status}\` per audit 2026-10-26.
- Halaman ini di-generate dari \`projects.manifest.json\`; perbarui manifest lalu jalankan
  \`node scripts/generate-project-docs.mjs --force\` bila data berubah.
`;
  await writeFile(target, body, "utf8");
  created++;
}

console.log(`✓ ${created} halaman dibuat, ${skipped} dilewati (sudah ada).`);
