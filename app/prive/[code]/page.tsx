import Link from "next/link";
import { getExamenPrive } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PriveCodePage({ params }: { params: { code: string } }) {
  const examen = await getExamenPrive(params.code);

  return (
    <div className="paper-grid flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg bg-board p-8 text-chalk">
        {!examen ? (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-chalk-coral">
              Code invalide
            </p>
            <h1 className="mt-2 font-display text-xl">
              Ce code ne correspond à aucun examen.
            </h1>
            <p className="mt-2 text-sm text-chalk/70">
              Vérifiez qu'il est saisi exactement comme communiqué par votre professeur.
            </p>
            <Link
              href="/prive"
              className="mt-6 inline-block text-sm text-chalk-yellow chalk-underline"
            >
              ← Réessayer
            </Link>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-chalk/60">
              Examen dédié
            </p>
            <h1 className="mt-2 font-display text-xl">
              {examen.eleve ? `Bonjour ${examen.eleve}` : "Votre examen"}
            </h1>
            <ul className="mt-6 space-y-2">
              {examen.fichiers.map((f) => (
                <li key={f}>
                  <a
                    href={`/examens-prives/${examen.code}/${f}`}
                    className="flex items-center justify-between rounded-md border border-chalk/20 px-4 py-3 text-sm hover:border-chalk-yellow"
                  >
                    <span>{f.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ")}</span>
                    <span className="text-chalk-yellow">Télécharger →</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
