import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maths — 1ère & Terminale",
  description: "Cours, exercices et QCM de mathématiques pour la 1ère générale et la Terminale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans text-ink">
        <header className="sticky top-0 z-40 overflow-hidden border-b border-white/40 bg-white/70 backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-10 -top-16 h-40 w-40 animate-blob rounded-full bg-bebe-pink/60 blur-3xl" />
            <div className="absolute right-10 -top-10 h-32 w-32 animate-blob rounded-full bg-sky-bleu/60 blur-3xl [animation-delay:2s]" />
          </div>

          <div className="relative mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
            <Link href="/" className="group flex items-center gap-2 font-display text-xl tracking-tight">
              <span className="inline-flex h-8 w-8 animate-floaty items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-sky-400 text-sm text-white shadow-md shadow-pink-200 transition-transform group-hover:scale-110">
                ∑
              </span>
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
                Maths
              </span>
            </Link>
            <nav className="flex flex-wrap justify-end gap-2 text-sm">
              <Link
                href="/1ere"
                className="rounded-full px-4 py-2 font-medium text-ink/70 transition-all hover:scale-105 hover:bg-pink-100 hover:text-pink-600"
              >
                1ère générale
              </Link>
              <Link
                href="/terminale"
                className="rounded-full px-4 py-2 font-medium text-ink/70 transition-all hover:scale-105 hover:bg-sky-100 hover:text-sky-600"
              >
                Terminale
              </Link>
              <Link
                href="/outils/traceur"
                className="rounded-full px-4 py-2 font-medium text-ink/70 transition-all hover:scale-105 hover:bg-fuchsia-100 hover:text-fuchsia-600"
              >
                Traceur
              </Link>
              <Link
                href="/examens"
                className="rounded-full bg-gradient-to-r from-pink-400 to-sky-400 px-4 py-2 font-medium text-white shadow-sm transition-transform hover:scale-105"
              >
                Examens
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mx-auto max-w-4xl px-6 py-10 text-sm text-ink/50">
          Support de cours mis à jour au fil de l'année. ✨
        </footer>
      </body>
    </html>
  );
}