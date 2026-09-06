import Link from "next/link";
import { getChapitres } from "@/lib/content";
import ChatBot from "@/components/ChatBot";

export default async function HomePage() {
  const premiere = await getChapitres("1ere");
  const terminale = await getChapitres("terminale");

  return (
    <div className="relative overflow-hidden bg-pink-sky-radial">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 animate-blob rounded-full bg-bebe-pink/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 animate-blob rounded-full bg-sky-bleu/50 blur-3xl [animation-delay:3s]" />

      <section className="relative mx-auto max-w-4xl px-6 py-20">
        <p className="mb-3 inline-block rounded-full bg-white/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-pink-500 shadow-sm backdrop-blur">
          Cours · Exercices · QCM
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Comprendre les maths,{" "}
          <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
            pas seulement les réciter.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-ink/70">
          Tout le programme de 1ère et Terminale, classé par chapitre, avec des quiz et TDs pour savoir où vous en êtes          pour savoir où vous en êtes — à votre rythme, et sans jamais vous ennuyer.
          Et pour aller plus loin : des annales pour le Supérieur, classes préparatoires, Licence/Bachelor et Master.
          
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <NiveauCard titre="1ère générale" nb={premiere.length} href="/1ere" accent="pink" />
          <NiveauCard titre="Terminale" nb={terminale.length} href="/terminale" accent="sky" />
          <NiveauCard
            titre="Supérieur"
            label="Annales et examens"
            href="/examens/superieur"
            accent="pink"
          />
        </div>

        <div className="mt-16">
          <ChatBot />
        </div>
      </section>
    </div>
  );
}

function NiveauCard({
  titre,
  nb,
  label,
  icon,
  href,
  accent,
}: {
  titre: string;
  nb?: number;
  label?: string;
  icon?: string;
  href: string;
  accent: "pink" | "sky";
}) {
  const gradient =
    accent === "pink" ? "from-pink-400 to-fuchsia-400 shadow-pink-200" : "from-sky-400 to-blue-400 shadow-sky-200";

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
      {icon && <span className="relative mb-1 block text-3xl">{icon}</span>}
      <h2 className="relative font-display text-2xl">{titre}</h2>
      <p className="relative mt-2 text-sm text-white/80">
        {label ?? `${nb} chapitre${nb && nb > 1 ? "s" : ""} disponible${nb && nb > 1 ? "s" : ""}`}
      </p>
      <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold">
        {label ? "Voir les examens" : "Voir les chapitres"}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}