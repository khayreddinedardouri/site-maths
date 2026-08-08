// Synchronise les PDF (TD, fiches d'exercices...) déposés directement dans
// content/{niveau}/{chapitre}/ (à côté de cours.mdx) vers
// public/content/{niveau}/{chapitre}/, seul endroit que Next.js sert réellement
// en statique et que la page de chapitre lit (voir lib/content.ts → getDocuments).
//
// Objectif : pouvoir déposer un PDF directement dans le dossier du chapitre
// (content/...) sans avoir à le dupliquer manuellement dans public/content/.
//
// Lancé automatiquement avant `npm run dev` et avant `npm run build`
// (voir "predev" / "prebuild" dans package.json). Peut aussi être lancé à la
// main avec `npm run sync-docs`.

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_CONTENT_DIR = path.join(ROOT, "public", "content");

// Extensions considérées comme des "documents" à copier (exercices, TD...).
// On ignore volontairement cours.mdx et qcm.json, qui sont lus directement
// depuis content/ par le site.
const DOC_EXTENSIONS = [".pdf"];

async function listDirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function filesDiffer(a, b) {
  try {
    const [statA, statB] = await Promise.all([fs.stat(a), fs.stat(b)]);
    return statA.size !== statB.size || statA.mtimeMs > statB.mtimeMs;
  } catch {
    return true; // la cible n'existe pas encore
  }
}

async function syncNiveau(niveau) {
  const niveauDir = path.join(CONTENT_DIR, niveau);
  const chapitres = await listDirs(niveauDir);

  let copied = 0;
  for (const chapitre of chapitres) {
    const chapitreDir = path.join(niveauDir, chapitre);
    let entries;
    try {
      entries = await fs.readdir(chapitreDir, { withFileTypes: true });
    } catch {
      continue;
    }

    const docs = entries.filter(
      (e) => e.isFile() && DOC_EXTENSIONS.includes(path.extname(e.name).toLowerCase())
    );
    if (docs.length === 0) continue;

    const targetDir = path.join(PUBLIC_CONTENT_DIR, niveau, chapitre);
    await fs.mkdir(targetDir, { recursive: true });

    for (const doc of docs) {
      const src = path.join(chapitreDir, doc.name);
      const dest = path.join(targetDir, doc.name);
      if (await filesDiffer(src, dest)) {
        await fs.copyFile(src, dest);
        copied += 1;
        console.log(`[sync-content-docs] ${niveau}/${chapitre}/${doc.name} → public/content/`);
      }
    }
  }
  return copied;
}

async function main() {
  const niveaux = await listDirs(CONTENT_DIR);
  let total = 0;
  for (const niveau of niveaux) {
    total += await syncNiveau(niveau);
  }
  if (total === 0) {
    console.log("[sync-content-docs] Rien à synchroniser (tout est déjà à jour).");
  } else {
    console.log(`[sync-content-docs] ${total} fichier(s) synchronisé(s) vers public/content/.`);
  }
}

main().catch((err) => {
  console.error("[sync-content-docs] Erreur :", err);
  process.exit(1);
});
