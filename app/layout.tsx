import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maths — 1ère & Terminale",
  description: "Cours, exercices et QCM de mathématiques pour la 1ère générale et la Terminale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans text-ink">
        <header className="bg-board text-chalk">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
            <Link href="/" className="font-display text-xl tracking-tight">
              M<span className="text-chalk-yellow">.</span>
            </Link>
            <nav className="flex flex-wrap gap-6 text-sm">
              <Link href="/1ere" className="chalk-underline hover:text-chalk-yellow">
                1ère générale
              </Link>
              <Link href="/terminale" className="chalk-underline hover:text-chalk-yellow">
                Terminale
              </Link>
              <Link href="/outils/traceur" className="chalk-underline hover:text-chalk-yellow">
                Traceur
              </Link>
              <Link href="/examens" className="chalk-underline hover:text-chalk-yellow">
                Examens
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mx-auto max-w-4xl px-6 py-10 text-sm text-ink/50">
          Support de cours mis à jour au fil de l'année.
        </footer>
      </body>
    </html>
  );
}
