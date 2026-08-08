import Link from "next/link";

const PARTIES = [
  {
    slug: "suites-arithmetiques-geometriques",
    titre: "Partie 1",
    sousTitre: "Suites arithmétiques, géométriques, arithmético-géométriques",
  },
  {
    slug: "suites-limites-convergence",
    titre: "Partie 2",
    sousTitre: "Limites et convergence des suites",
  },
  {
    slug: "suites-recurrence",
    titre: "Partie 3",
    sousTitre: "Raisonnement par récurrence",
  },
  {
    slug: "suites-fonctions",
    titre: "Partie 4",
    sousTitre: "Suites définies par une fonction u(n+1) = f(u(n))",
  },
];

export default function SuitesHubPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-pink-sky-radial">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 animate-blob rounded-full bg-bebe-pink/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 animate-blob rounded-full bg-sky-bleu/50 blur-3xl [animation-delay:3s]" />

      <div className="relative mx-auto max-w-3xl px-6 py-16">
        <Link href="/terminale" className="font-mono text-xs uppercase tracking-widest text-board-light">
          ← Terminale
        </Link>

        <h1 className="mt-3 font-display text-3xl font-semibold">Suites</h1>
        <p className="mt-3 text-ink/60">
          Ce chapitre est découpé en 4 parties, avec des mini-quiz au fil du cours pour
          vérifier ta compréhension à chaque étape.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PARTIES.map((p, i) => (
            <Link
              key={p.slug}
              href={`/terminale/${p.slug}`}
              className="group relative overflow-hidden rounded-2xl border-2 border-pink-100 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-400 to-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-sky-400 text-sm font-bold text-white transition-transform group-hover:scale-110">
                {i + 1}
              </span>
              <h2 className="mt-3 font-display text-lg font-semibold text-ink transition-colors group-hover:text-white">
                {p.titre}
              </h2>
              <p className="mt-1 text-sm text-ink/60 transition-colors group-hover:text-white/90">
                {p.sousTitre}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pink-500 transition-colors group-hover:text-white">
                Commencer
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}