import Link from "next/link";
import { getChapitres } from "@/lib/content";

export default async function HomePage() {
  const premiere = await getChapitres("1ere");
  const terminale = await getChapitres("terminale");

  return (
    <div className="paper-grid">
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-board-light">
          Cours · Exercices · QCM
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Comprendre les maths, pas seulement les réciter.
        </h1>
        <p className="mt-4 max-w-xl text-ink/70">
          Tout le programme de 1ère et Terminale, classé par chapitre, avec des QCM
          corrigés en direct pour savoir où vous en êtes.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <NiveauCard
            titre="1ère générale"
            nb={premiere.length}
            href="/1ere"
          />
          <NiveauCard
            titre="Terminale"
            nb={terminale.length}
            href="/terminale"
          />
        </div>
      </section>
    </div>
  );
}

function NiveauCard({ titre, nb, href }: { titre: string; nb: number; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-lg bg-board p-8 text-chalk transition-colors hover:bg-board-light"
    >
      <h2 className="font-display text-2xl">{titre}</h2>
      <p className="mt-2 text-sm text-chalk/70">
        {nb} chapitre{nb > 1 ? "s" : ""} disponible{nb > 1 ? "s" : ""}
      </p>
      <span className="mt-6 inline-block text-sm text-chalk-yellow chalk-underline">
        Voir les chapitres →
      </span>
    </Link>
  );
}
