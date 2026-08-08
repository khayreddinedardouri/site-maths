import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapitres, type ChapitreMeta, type Niveau } from "@/lib/content";

const LABELS: Record<Niveau, string> = {
  "1ere": "1ère générale",
  terminale: "Terminale",
};

// Slugs des 4 parties du chapitre Suites : elles sont regroupées sous une seule
// entrée "Suites" dans la liste, et accessibles via /terminale/suites (page hub).
const SLUGS_SUITES = [
  "suites-arithmetiques-geometriques",
  "suites-limites-convergence",
  "suites-recurrence",
  "suites-fonctions",
];

export async function generateStaticParams() {
  return [{ niveau: "1ere" }, { niveau: "terminale" }];
}

function groupByPartie(chapitres: ChapitreMeta[]) {
  const groupes = new Map<string, ChapitreMeta[]>();
  for (const c of chapitres) {
    const cle = c.partie ?? "";
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(c);
  }
  return groupes;
}

/** Remplace les 4 sous-chapitres "suites-..." par une seule entrée "Suites" (hub). */
function regrouperSuites(chapitres: ChapitreMeta[], niveau: Niveau): ChapitreMeta[] {
  if (niveau !== "terminale") return chapitres;

  const partiesSuites = chapitres.filter((c) => SLUGS_SUITES.includes(c.slug));
  if (partiesSuites.length === 0) return chapitres;

  const reste = chapitres.filter((c) => !SLUGS_SUITES.includes(c.slug));
  const ordreMin = Math.min(...partiesSuites.map((c) => c.ordre));
  const partieLabel = partiesSuites[0].partie;

  const entreeSuites: ChapitreMeta = {
    slug: "suites",
    titre: "Suites",
    ordre: ordreMin,
    ...(partieLabel ? { partie: partieLabel } : {}),
  };

  return [...reste, entreeSuites].sort((a, b) => a.ordre - b.ordre);
}

export default async function NiveauPage({ params }: { params: { niveau: string } }) {
  const niveau = params.niveau as Niveau;
  if (!LABELS[niveau]) notFound();

  const chapitresBruts = await getChapitres(niveau);
  const chapitres = regrouperSuites(chapitresBruts, niveau);
  const groupes = groupByPartie(chapitres);
  const aDesParties = [...groupes.keys()].some((k) => k !== "");

  return (
    <div className="paper-grid min-h-[70vh]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-board-light">
          Programme
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{LABELS[niveau]}</h1>

        {chapitres.length === 0 ? (
          <p className="mt-10 text-ink/60">
            Aucun chapitre publié pour l'instant. Ajoutez un dossier dans{" "}
            <code className="font-mono text-sm">content/{niveau}/</code>.
          </p>
        ) : aDesParties ? (
          [...groupes.entries()].map(([partie, liste]) => (
            <section key={partie} className="mt-12 first:mt-10">
              <h2 className="font-mono text-xs uppercase tracking-widest text-chalk-coral">
                {partie || "Autres chapitres"}
              </h2>
              <ChapitreListe niveau={niveau} chapitres={liste} />
            </section>
          ))
        ) : (
          <div className="mt-10">
            <ChapitreListe niveau={niveau} chapitres={chapitres} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChapitreListe({ niveau, chapitres }: { niveau: Niveau; chapitres: ChapitreMeta[] }) {
  return (
    <ul className="mt-3 divide-y divide-board/10">
      {chapitres.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/${niveau}/${c.slug}`}
            className="flex items-center justify-between py-5 transition-colors hover:text-pink-500"
          >
            <span className="font-display text-lg">
              <span className="mr-3 font-mono text-sm text-ink/30">{Math.floor(c.ordre)}</span>
              {c.titre}
            </span>
            <span className="font-mono text-sm text-ink/40">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}