import Link from "next/link";
import { EXAMENS_NIVEAUX, getExamens, type ExamenNiveau } from "@/lib/content";

export default async function ExamensIndexPage() {
  const niveaux = Object.keys(EXAMENS_NIVEAUX) as ExamenNiveau[];
  const counts = await Promise.all(niveaux.map((n) => getExamens(n)));

  return (
    <div className="paper-grid min-h-[70vh]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-board-light">
          Annales
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Examens</h1>
        <p className="mt-3 text-ink/60">Choisissez un niveau pour rechercher un examen.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {niveaux.map((niveau, i) => (
            <Link
              key={niveau}
              href={`/examens/${niveau}`}
              className="group block rounded-lg bg-board p-6 text-chalk transition-colors hover:bg-board-light"
            >
              <h2 className="font-display text-xl">{EXAMENS_NIVEAUX[niveau]}</h2>
              <p className="mt-2 text-sm text-chalk/70">
                {counts[i].length} examen{counts[i].length > 1 ? "s" : ""}
              </p>
              <span className="mt-6 inline-block text-sm text-chalk-yellow chalk-underline">
                Rechercher →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink/50">
          Un examen dédié vous a été assigné ?{" "}
          <Link href="/prive" className="text-board-light chalk-underline hover:text-chalk-coral">
            Entrez votre code →
          </Link>
        </p>
      </div>
    </div>
  );
}
