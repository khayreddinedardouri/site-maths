import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getChapitres, getCours, getDocuments, getQcm, type Niveau } from "@/lib/content";
import QcmPlayer from "@/components/QcmPlayer";
import VideoEmbed from "@/components/VideoEmbed";
import MiniQuiz from "@/components/MiniQuiz";
import { ProgressProvider } from "@/components/ProgressContext";
import ProgressBar from "@/components/ProgressBar";

const NIVEAUX: Niveau[] = ["1ere", "terminale"];

export async function generateStaticParams() {
  const params = [];
  for (const niveau of NIVEAUX) {
    const chapitres = await getChapitres(niveau);
    for (const c of chapitres) {
      params.push({ niveau, chapitre: c.slug });
    }
  }
  return params;
}

export default async function ChapitrePage({
  params,
}: {
  params: { niveau: string; chapitre: string };
}) {
  const niveau = params.niveau as Niveau;
  if (!NIVEAUX.includes(niveau)) notFound();

  let cours;
  try {
    cours = await getCours(niveau, params.chapitre);
  } catch {
    notFound();
  }

  const [documents, qcm] = await Promise.all([
    getDocuments(niveau, params.chapitre),
    getQcm(niveau, params.chapitre),
  ]);

  // Optionnel : URL de soumission d'un Google Form pour agréger les scores QCM.
  const sheetUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL;

  return (
    <div className="paper-grid min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href={`/${niveau}`} className="font-mono text-xs uppercase tracking-widest text-board-light">
          ← {niveau === "1ere" ? "1ère générale" : "Terminale"}
        </Link>

        <h1 className="mt-3 font-display text-3xl font-semibold">{cours.titre}</h1>

        <ProgressProvider>
          <ProgressBar />
          <article className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-semibold">
            <MDXRemote
              source={cours.content}
              components={{ VideoEmbed, MiniQuiz }}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkMath],
                  rehypePlugins: [rehypeKatex],
                },
              }}
            />
          </article>
        </ProgressProvider>

        <div className="mt-10 rounded-lg border border-board/15 p-6">
          <h2 className="font-display text-lg">Exercices</h2>
          {documents.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {documents.map((doc) => (
                <li key={doc}>
                  <a
                    href={`/content/${niveau}/${params.chapitre}/${doc}`}
                    className="text-sm text-board-light chalk-underline hover:text-chalk-coral"
                  >
                    {doc}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink/50">
              Aucun exercice pour l'instant. Déposez un PDF dans{" "}
              <code className="font-mono text-xs">
                public/content/{niveau}/{params.chapitre}/
              </code>{" "}
              pour qu'il apparaisse ici.
            </p>
          )}
        </div>

        {qcm && <QcmPlayer qcm={qcm} sheetUrl={sheetUrl} />}
      </div>
    </div>
  );
}