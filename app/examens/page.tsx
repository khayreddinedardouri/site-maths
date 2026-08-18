import Link from "next/link";
import { EXAMENS_NIVEAUX, getExamens, type ExamenNiveau } from "@/lib/content";

export default async function ExamensIndexPage() {
  const niveaux = Object.keys(EXAMENS_NIVEAUX) as ExamenNiveau[];
  const counts = await Promise.all(niveaux.map((n) => getExamens(n)));

  return (
    <div className="paper-grid relative min-h-[70vh] overflow-hidden bg-pink-sky-radial">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 animate-blob rounded-full bg-bebe-pink/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 animate-blob rounded-full bg-sky-bleu/40 blur-3xl [animation-delay:3s]" />

      <div className="relative mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-pink-500">
          Annales
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Examens</h1>
        <p className="mt-3 text-ink/60">Choisissez un niveau pour rechercher un examen.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {niveaux.map((niveau, i) => {
            const gradient =
              i % 2 === 0
                ? "from-pink-400 to-fuchsia-400 shadow-pink-200"
                : "from-sky-400 to-blue-400 shadow-sky-200";

            return (
              <Link
                key={niveau}
                href={`/examens/${niveau}`}
                className={`group relative block overflow-hidden rounded-lg bg-gradient-to-br p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${gradient}`}
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                <h2 className="relative font-display text-xl">{EXAMENS_NIVEAUX[niveau]}</h2>
                <p className="relative mt-2 text-sm text-white/80">
                  {counts[i].length} examen{counts[i].length > 1 ? "s" : ""}
                </p>
                <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold">
                  Rechercher
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-ink/50">
          Un examen dédié vous a été assigné ?{" "}
          <Link href="/prive" className="text-sky-500 chalk-underline hover:text-pink-500">
            Entrez votre code →
          </Link>
        </p>
      </div>
    </div>
  );
}