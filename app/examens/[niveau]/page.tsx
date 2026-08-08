import Link from "next/link";
import { notFound } from "next/navigation";
import { EXAMENS_NIVEAUX, getExamens, type ExamenNiveau } from "@/lib/content";
import ExamensSearch from "@/components/ExamensSearch";

export async function generateStaticParams() {
  return Object.keys(EXAMENS_NIVEAUX).map((niveau) => ({ niveau }));
}

export default async function ExamensNiveauPage({ params }: { params: { niveau: string } }) {
  const niveau = params.niveau as ExamenNiveau;
  if (!EXAMENS_NIVEAUX[niveau]) notFound();

  const examens = await getExamens(niveau);

  return (
    <div className="paper-grid min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/examens" className="font-mono text-xs uppercase tracking-widest text-board-light">
          ← Examens
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">{EXAMENS_NIVEAUX[niveau]}</h1>
        <p className="mt-3 text-ink/60">
          {examens.length === 0
            ? "Aucun examen déposé pour l'instant dans ce niveau."
            : `${examens.length} examen${examens.length > 1 ? "s" : ""}, classés par chapitre.`}
        </p>

        <div className="mt-8">
          <ExamensSearch examens={examens} />
        </div>
      </div>
    </div>
  );
}
