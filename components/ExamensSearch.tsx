"use client";

import { useMemo, useState } from "react";
import type { Examen } from "@/lib/content";

export default function ExamensSearch({ examens }: { examens: Examen[] }) {
  const [requete, setRequete] = useState("");

  const resultats = useMemo(() => {
    const q = requete.trim().toLowerCase();
    if (!q) return examens;
    return examens.filter(
      (e) => e.nom.toLowerCase().includes(q) || e.chapitre.toLowerCase().includes(q)
    );
  }, [requete, examens]);

  const groupes = useMemo(() => {
    const map = new Map<string, Examen[]>();
    for (const e of resultats) {
      if (!map.has(e.chapitre)) map.set(e.chapitre, []);
      map.get(e.chapitre)!.push(e);
    }
    return map;
  }, [resultats]);

  return (
    <div>
      <input
        type="search"
        value={requete}
        onChange={(e) => setRequete(e.target.value)}
        placeholder="Rechercher un examen ou un chapitre..."
        aria-label="Rechercher un examen par nom ou par chapitre"
        className="w-full rounded-md border border-board/20 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-chalk-yellow"
      />

      {resultats.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50">
          Aucun examen ne correspond à « {requete} ».
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {[...groupes.entries()].map(([chapitre, liste]) => (
            <section key={chapitre}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-chalk-coral">
                {chapitre}
              </h2>
              <ul className="mt-2 divide-y divide-board/10">
                {liste.map((e) => (
                  <li key={e.url}>
                    <a
                      href={e.url}
                      className="flex items-center justify-between py-3 transition-colors hover:text-board-light"
                    >
                      <span className="font-display text-base">{e.nom}</span>
                      <span className="font-mono text-sm text-ink/40">Télécharger →</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
