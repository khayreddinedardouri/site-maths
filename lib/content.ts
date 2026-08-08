import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Niveau = "1ere" | "terminale";

export type ChapitreMeta = {
  slug: string;
  titre: string;
  ordre: number;
  partie?: string;
};

export type QcmQuestion = {
  id: string;
  question: string;
  choix: string[];
  reponse: number;
  explication: string;
};

export type Qcm = {
  chapitre: string;
  questions: QcmQuestion[];
};

/** Liste les chapitres d'un niveau, triés par ordre défini dans le frontmatter du cours. */
export async function getChapitres(niveau: Niveau): Promise<ChapitreMeta[]> {
  const dir = path.join(CONTENT_DIR, niveau);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const chapitres = await Promise.all(
    entries.map(async (slug): Promise<ChapitreMeta | null> => {
      const coursPath = path.join(dir, slug, "cours.mdx");
      try {
        const raw = await fs.readFile(coursPath, "utf-8");
        const { data } = matter(raw);
        const meta: ChapitreMeta = {
          slug,
          titre: typeof data.titre === "string" ? data.titre : slug,
          ordre: typeof data.ordre === "number" ? data.ordre : 999,
        };
        if (typeof data.partie === "string") meta.partie = data.partie;
        return meta;
      } catch {
        return null;
      }
    })
  );

  return chapitres
    .filter((c): c is ChapitreMeta => c !== null)
    .sort((a, b) => a.ordre - b.ordre);
}

/** Charge le cours (markdown brut + frontmatter) d'un chapitre. */
export async function getCours(niveau: Niveau, slug: string) {
  const coursPath = path.join(CONTENT_DIR, niveau, slug, "cours.mdx");
  const raw = await fs.readFile(coursPath, "utf-8");
  const { data, content } = matter(raw);
  return { titre: (data.titre as string) ?? slug, content };
}

/** Charge le QCM d'un chapitre, si présent. Retourne null sinon. */
export async function getQcm(niveau: Niveau, slug: string): Promise<Qcm | null> {
  const qcmPath = path.join(CONTENT_DIR, niveau, slug, "qcm.json");
  try {
    const raw = await fs.readFile(qcmPath, "utf-8");
    return JSON.parse(raw) as Qcm;
  } catch {
    return null;
  }
}

export type ExamenPrive = {
  code: string;
  eleve?: string;
  fichiers: string[];
};

/**
 * Cherche un examen dédié à partir d'un code d'accès.
 * Structure attendue : public/examens-prives/{code}/mon-examen.pdf
 * Le code est assaini (alphanumérique, - et _ uniquement) pour éviter
 * toute tentative de traversée de chemin.
 */
export async function getExamenPrive(code: string): Promise<ExamenPrive | null> {
  const safeCode = code.trim().replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeCode) return null;

  const dir = path.join(process.cwd(), "public", "examens-prives", safeCode);
  try {
    const entries = await fs.readdir(dir);
    const fichiers = entries.filter((f) => f.toLowerCase().endsWith(".pdf"));
    if (fichiers.length === 0) return null;

    let eleve: string | undefined;
    try {
      const raw = await fs.readFile(path.join(dir, "meta.json"), "utf-8");
      const meta = JSON.parse(raw);
      if (typeof meta.eleve === "string") eleve = meta.eleve;
    } catch {
      // pas de meta.json, pas grave
    }

    return { code: safeCode, eleve, fichiers };
  } catch {
    return null;
  }
}

export type ExamenNiveau = "1ere" | "terminale" | "superieur";

export const EXAMENS_NIVEAUX: Record<ExamenNiveau, string> = {
  "1ere": "1ère générale",
  terminale: "Terminale",
  superieur: "Supérieur",
};

export type Examen = {
  nom: string;
  fichier: string;
  chapitre: string;
  chapitreSlug: string;
  url: string;
};

function slugToLabel(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Liste les examens d'un niveau, groupés par chapitre.
 * Structure attendue : public/examens/{niveau}/{chapitre}/mon-examen.pdf
 */
export async function getExamens(niveau: ExamenNiveau): Promise<Examen[]> {
  const dir = path.join(process.cwd(), "public", "examens", niveau);
  let chapitreDirs: string[];
  try {
    chapitreDirs = await fs.readdir(dir);
  } catch {
    return [];
  }

  const examens: Examen[] = [];
  for (const chapitreSlug of chapitreDirs) {
    const chapitreDir = path.join(dir, chapitreSlug);
    let stat;
    try {
      stat = await fs.stat(chapitreDir);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;

    const fichiers = await fs.readdir(chapitreDir);
    for (const fichier of fichiers) {
      if (!fichier.toLowerCase().endsWith(".pdf")) continue;
      examens.push({
        fichier,
        nom: fichier.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim(),
        chapitreSlug,
        chapitre: slugToLabel(chapitreSlug),
        url: `/examens/${niveau}/${chapitreSlug}/${fichier}`,
      });
    }
  }

  return examens.sort(
    (a, b) => a.chapitre.localeCompare(b.chapitre, "fr") || a.nom.localeCompare(b.nom, "fr")
  );
}

/**
 * Liste les documents PDF disponibles pour un chapitre (exercices, fiches...).
 * Les PDF doivent être placés dans public/content/{niveau}/{slug}/ pour être
 * servis directement par Next.js en tant que fichiers statiques.
 */
export async function getDocuments(niveau: Niveau, slug: string) {
  const dir = path.join(process.cwd(), "public", "content", niveau, slug);
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith(".pdf"));
  } catch {
    return [];
  }
}
