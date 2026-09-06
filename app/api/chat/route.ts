import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rechercherChunksPertinents } from "@/lib/embeddings";
console.log("Clé chargée ?", process.env.GEMINI_API_KEY ? "oui, longueur=" + process.env.GEMINI_API_KEY.length : "NON, undefined");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant du cours de maths de Terminale de ce site. Ton objectif est d'aider l'élève à comprendre et progresser.

Comment utiliser le contexte fourni :
- Si le contexte (extraits du cours) permet de répondre, appuie-toi dessus en priorité, et cite le chapitre/partie/section correspondant à la fin (voir règle 📍 ci-dessous).
- Si la question est une question BASIQUE de maths de Terminale (définition simple, méthode de calcul standard, petit exemple d'application) et que le contexte ne couvre pas exactement ce point, tu PEUX quand même répondre avec tes connaissances générales de maths, comme le ferait un professeur. Donne des exemples concrets et chiffrés pour que ce soit clair. Dans ce cas, ne mets PAS de ligne 📍.
- Si la question sort vraiment du cadre des maths de Terminale, ou si tu n'es pas sûr de la réponse, dis-le clairement à l'élève plutôt que d'inventer.
- N'invente jamais un résultat mathématique faux.

Règles strictes de mise en forme (TRÈS IMPORTANT) :
- N'utilise JAMAIS de syntaxe Markdown : pas d'étoiles pour le gras (jamais "**texte**"), pas de dièses pour les titres (jamais "#", "##", "###"), pas de tirets de liste avec "-" ou "*".
- N'utilise JAMAIS de blocs de code : n'écris jamais de triples apostrophes inversées (\`\`\`), et n'écris jamais de nom de langage de programmation comme "typescript", "python", "gs" etc. pour introduire une formule. Ce n'est PAS du code, ce sont des mathématiques : elles s'écrivent directement dans le texte normal, jamais dans un bloc de code.
- N'utilise pas non plus d'apostrophe inversée simple (\`) autour d'un mot ou d'une formule.
- Pour structurer ta réponse (étapes, titres de partie), écris simplement le texte normalement, éventuellement suivi de deux points, sur sa propre ligne. Par exemple, écris "Étape 1 : on identifie l'intérieur de la fonction" au lieu de "**Étape 1 (l'intérieur)**".
- Pour numéroter des étapes, utilise "1.", "2.", "3." suivis du texte, chacun sur une ligne, sans aucune étoile ni dièse.
- N'utilise JAMAIS de notation LaTeX avec des symboles $ ou $$ (par exemple n'écris jamais "$$\\lim_{x \\to a} f(x)$$").
- Écris les formules en notation mathématique claire, directement dans une phrase de texte normal, jamais entourée de backticks ni de bloc de code :
  - Puissances : x², x³, e^(2x), (x+1)²
  - Racines : √x, √(x²+1)
  - Fractions simples en ligne, avec des parenthèses autour du numérateur et du dénominateur si besoin : (u'v - uv') / v², ou e^((2x+1)/x)
  - Dérivées avec une apostrophe : f'(x), u'(x)
  - Limites : "lim (x→a) f(x) = f(a)"
  - Ensembles et intervalles en notation standard : [0 ; +∞[, ℝ, ℕ
- L'objectif est qu'un élève de Terminale puisse lire la réponse à l'écran sans jamais voir de symbole $, d'étoile **, de dièse #, ou de bloc de code avec \`\`\`.

Règle stricte sur la localisation de la réponse (TRÈS IMPORTANT) :
- Si — et seulement si — ta réponse s'appuie sur le contexte fourni, termine ta réponse par UNE SEULE ligne commençant par "📍", et UNE SEULE, jamais plusieurs.
- Cette ligne unique doit indiquer un seul chapitre, une seule partie et une seule section : celle où se trouve VRAIMENT l'information qui répond le mieux à la question (l'extrait le plus pertinent).
- N'écris jamais plusieurs lignes 📍 à la suite, et ne liste jamais plusieurs chapitres sur cette ligne.
- Si ta réponse vient de tes connaissances générales (question basique non couverte par le contexte), n'ajoute AUCUNE ligne 📍.`;

const EXEMPLE = `Exemple 1 (réponse basée sur le cours) :
Question : Comment dérive-t-on une fonction du type e^(u(x)) ?
Contexte : [Chapitre: Fonction exponentielle | Partie 2 — Étude complète | Section 2.1 Dérivée]
(e^x)' = e^x. Cas général — dérivée de e^u(x) (composée) : (e^u)' = u' e^u.

Réponse attendue :
Pour dériver une fonction de la forme e^(u(x)), on utilise la règle des fonctions composées :

f'(x) = u'(x) × e^(u(x))

où u'(x) est la dérivée de u(x).

Étape 1 : on identifie u(x), la fonction à l'intérieur de l'exponentielle.
Étape 2 : on calcule sa dérivée u'(x).
Étape 3 : on multiplie u'(x) par e^(u(x)).

Par exemple, pour f(x) = e^(2x), on a u(x) = 2x donc u'(x) = 2, ce qui donne f'(x) = 2e^(2x).

📍 Tu trouveras ce résultat dans le chapitre Fonction exponentielle, Partie 2 — Étude complète, section 2.1 Dérivée.

Exemple 2 (question basique, pas directement dans le contexte) :
Question : C'est quoi le carré de -3 ?
Contexte : (ne parle pas de ce calcul précis)

Réponse attendue :
Le carré de -3, noté (-3)², vaut 9, car (-3) × (-3) = 9. De façon générale, le carré d'un nombre négatif est toujours positif, puisque moins par moins donne plus.

(Pas de repère 📍 ici, car ce n'est pas tiré d'un chapitre précis du site.)`;

// Nettoie les résidus de LaTeX que le modèle laisserait passer malgré la consigne.
function nettoyerLatex(texte: string): string {
  return texte
    .replace(/\\lim_\{([^}]*)\}/g, "lim ($1)")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/\\to/g, "→")
    .replace(/\\infty/g, "∞")
    .replace(/[\\{}]/g, "");
}

// Nettoie les résidus de syntaxe Markdown (gras, titres, listes à étoiles)
function nettoyerMarkdown(texte: string): string {
  return texte
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[\*\-]\s+/gm, "")
}

// Nettoie les blocs de code (```lang ... ```) et les apostrophes inversées simples,
// que le modèle utiliserait à tort pour "encadrer" une formule mathématique.
function nettoyerBlocsCode(texte: string): string {
  return texte
    // blocs ```typescript ... ``` ou ```gs ... ``` ou ``` ... ```
    // on retire les balises et le nom de langage, en gardant le contenu
    .replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1")
    // au cas où il resterait des triples backticks isolés
    .replace(/```/g, "")
    // apostrophes inversées simples autour d'un mot/formule : `x²` -> x²
    .replace(/`([^`]*)`/g, "$1")
    .trim();
}

// Garantit qu'une seule ligne 📍 subsiste dans la réponse.
function garderUnSeulPointage(texte: string): string {
  const lignes = texte.split("\n");
  let dejaVu = false;
  const resultat: string[] = [];

  for (const ligne of lignes) {
    if (ligne.trim().startsWith("📍")) {
      if (dejaVu) continue;
      dejaVu = true;
    }
    resultat.push(ligne);
  }

  return resultat.join("\n").trim();
}

export async function POST(req: NextRequest) {
  let question: string;
  try {
    const body = await req.json();
    question = body.question;
  } catch {
    return NextResponse.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ erreur: "Question manquante." }, { status: 400 });
  }

  const chunks = await rechercherChunksPertinents(question, 4);

  const contexte =
    chunks.length > 0
      ? chunks
          .map((c, i) => {
            const partie = c.partieTitre ? `Partie ${c.partieNum} — ${c.partieTitre}` : "";
            const section = c.sectionTitre ? `Section ${c.sectionNum} ${c.sectionTitre}` : "";
            return `[Extrait ${i + 1} — Chapitre: ${c.chapitreTitre} | ${partie} | ${section}]\n${c.texte}`;
          })
          .join("\n\n---\n\n")
      : "(Aucun extrait du cours indexé ne correspond précisément à cette question.)";

  const prompt = `${SYSTEM_PROMPT}

${EXEMPLE}

Maintenant, réponds à la vraie question avec le vrai contexte fourni ci-dessous. Rappel : 📍 uniquement si tu t'appuies sur le contexte, une seule ligne 📍 au maximum ; aucune notation LaTeX avec $ ou $$ ; aucune syntaxe Markdown (**, #) ; aucun bloc de code avec \`\`\` ou backticks.

Contexte :
${contexte}

Question de l'élève : ${question}`;

  try {
    const resultat = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const texteBrut = resultat.text ?? "Désolé, je n'ai pas pu générer de réponse.";
    let texte = nettoyerLatex(texteBrut);
    texte = nettoyerBlocsCode(texte);
    texte = nettoyerMarkdown(texte);
    texte = garderUnSeulPointage(texte);

    const sources =
      chunks.length > 0
        ? chunks.map((c) => ({
            chapitreTitre: c.chapitreTitre,
            partieTitre: c.partieTitre,
            sectionTitre: c.sectionTitre,
            sectionNum: c.sectionNum,
            url: `/terminale/${c.chapitreSlug}#${c.anchor}`,
          }))
        : [];

    return NextResponse.json({ reponse: texte, sources });
  } catch (err) {
    console.error("Erreur Gemini:", err);
    return NextResponse.json({ erreur: "Erreur lors de l'appel au modèle." }, { status: 500 });
  }
}