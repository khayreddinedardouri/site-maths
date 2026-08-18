import Link from "next/link";
import { getExamenPrive } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PriveCodePage({ params }: { params: { code: string } }) {
  const examen = await getExamenPrive(params.code);

  return (
    <div className="paper-grid flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#111114] bg-gradient-to-br from-[#F6D68A] to-[#E8B94B] p-8 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.25)]">
        {!examen ? (
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#111114]/70">
              Accès VIP
            </p>
            <h1 className="mt-3 font-display text-xl font-semibold text-[#111114]">
              Code invalide
            </h1>
            <p className="mt-2 text-sm text-[#111114]/70">
              Ce code ne correspond à aucun examen. Vérifiez qu'il est saisi
              exactement comme communiqué par votre professeur.
            </p>
            <Link
              href="/prive"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#111114] underline decoration-2 underline-offset-4 hover:opacity-70"
            >
              ← Réessayer
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-[#111114]/40" />
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#111114]/70">
                Accès VIP
              </p>
              <span className="h-px flex-1 bg-[#111114]/40" />
            </div>

            <h1 className="mt-4 text-center font-display text-2xl font-semibold text-[#111114]">
              {examen.eleve ? `Bonjour, ${examen.eleve}` : "Votre examen"}
            </h1>
            <p className="mt-1 text-center text-xs text-[#111114]/60">
              Accès personnel et confidentiel
            </p>

            <ul className="mt-7 space-y-3">
              {examen.fichiers.map((f) => (
                <li key={f}>
                  <a
                    href={`/examens-prives/${examen.code}/${f}`}
                    className="group flex items-center justify-between rounded-lg border-2 border-[#111114]/70 bg-[#F6D68A]/40 px-4 py-3 text-sm font-medium text-[#111114] transition-all hover:border-[#111114] hover:bg-white/50"
                  >
                    <span>{f.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ")}</span>
                    <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1">
                      Télécharger →
                    </span>
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