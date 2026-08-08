import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getChapitres, getCours, getDocuments, getQcm, type Niveau } from "@/lib/content";
import QcmPlayer from "@/components/QcmPlayer";
import VideoEmbed from "@/components/VideoEmbed";

const NIVEAUX: Niveau[] = ["1ere", "terminale"];

// Composants disponibles directement dans les fichiers cours.mdx (ex: <VideoEmbed ... />)
const mdxComponents = { VideoEmbed };

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

        <article className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-semibold">
          <MDXRemote
            source={cours.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
              },
            }}
          />
        </article>

        <div className="mt-10 flex flex-col gap-3 rounded-lg border border-chalk-blue/30 bg-chalk-blue/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg">Envie de visualiser une courbe ou une suite ?</h2>
            <p className="mt-1 text-sm text-ink/60">
              Utilisez le traceur interactif pour tracer des fonctions ou simuler des suites récurrentes.
            </p>
          </div>
          <Link
            href="/outils/traceur"
            className="whitespace-nowrap rounded-md bg-board px-5 py-2 text-sm font-medium text-chalk hover:bg-board-light"
          >
            Ouvrir le traceur →
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-board/15 p-6">
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
