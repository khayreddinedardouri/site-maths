import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";
import { getToutesLesSections, type Section } from "@/lib/content";

export type Chunk = Section & { embedding: number[] };

let indexPromise: Promise<Chunk[]> | null = null;
let extracteurPromise: Promise<FeatureExtractionPipeline> | null = null;

/** Charge le modèle d'embedding local une seule fois (~90 Mo, mis en cache après le 1er appel). */
function getExtracteur() {
  if (!extracteurPromise) {
    extracteurPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extracteurPromise;
}

function nettoyer(texte: string): string {
  return texte
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function embedder(texte: string): Promise<number[]> {
  const extracteur = await getExtracteur();
  const sortie = await extracteur(texte, { pooling: "mean", normalize: true });
  return Array.from(sortie.data as Float32Array);
}

async function construireIndex(): Promise<Chunk[]> {
  const sections = await getToutesLesSections("terminale");
  const chunks: Chunk[] = [];

  for (const section of sections) {
    const texteNettoye = nettoyer(section.texte);
    if (texteNettoye.length < 20) continue;

    const embedding = await embedder(
      `Chapitre: ${section.chapitreTitre}. ${
        section.partieTitre ? `Partie: ${section.partieTitre}. ` : ""
      }${section.sectionTitre ? `Section: ${section.sectionTitre}. ` : ""}\n${texteNettoye}`
    );

    chunks.push({ ...section, texte: texteNettoye, embedding });
  }

  return chunks;
}

export function getIndex(): Promise<Chunk[]> {
  if (!indexPromise) indexPromise = construireIndex();
  return indexPromise;
}

function similariteCosinus(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function rechercherChunksPertinents(question: string, k = 4): Promise<Chunk[]> {
  const index = await getIndex();
  const embeddingQuestion = await embedder(question);

  return index
    .map((chunk) => ({ chunk, score: similariteCosinus(embeddingQuestion, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}