"use client";

import { useState } from "react";
import type { Qcm } from "@/lib/content";

type Reponses = Record<string, number>;

export default function QcmPlayer({ qcm, sheetUrl }: { qcm: Qcm; sheetUrl?: string }) {
  const [reponses, setReponses] = useState<Reponses>({});
  const [valide, setValide] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const total = qcm.questions.length;
  const score = qcm.questions.reduce(
    (acc, q) => acc + (reponses[q.id] === q.reponse ? 1 : 0),
    0
  );
  const complet = Object.keys(reponses).length === total;

  function choisir(questionId: string, choixIndex: number) {
    if (valide) return;
    setReponses((prev) => ({ ...prev, [questionId]: choixIndex }));
  }

  async function envoyerFeedback() {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapitre: qcm.chapitre, score, total, date: new Date().toISOString() }),
      });
    } finally {
      setEnvoye(true);
    }
  }

  return (
    <div className="mt-10 rounded-lg bg-board p-6 text-chalk sm:p-8">
      <h2 className="font-display text-xl">QCM — {qcm.chapitre}</h2>

      <div className="mt-6 space-y-8">
        {qcm.questions.map((q, qi) => (
          <fieldset key={q.id}>
            <legend className="text-sm text-chalk/80">
              {qi + 1}. {q.question}
            </legend>
            <div className="mt-3 space-y-2">
              {q.choix.map((choix, ci) => {
                const selectionne = reponses[q.id] === ci;
                const estCorrecte = ci === q.reponse;
                let etat = "border-chalk/20";
                if (valide && selectionne) {
                  etat = estCorrecte ? "border-chalk-blue bg-chalk-blue/10" : "border-chalk-coral bg-chalk-coral/10";
                } else if (valide && estCorrecte) {
                  etat = "border-chalk-blue/60";
                } else if (selectionne) {
                  etat = "border-chalk-yellow";
                }

                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => choisir(q.id, ci)}
                    disabled={valide}
                    className={`block w-full rounded-md border px-4 py-2 text-left text-sm transition-colors ${etat}`}
                  >
                    {choix}
                  </button>
                );
              })}
            </div>
            {valide && (
              <p className="mt-2 text-xs text-chalk/60">{q.explication}</p>
            )}
          </fieldset>
        ))}
      </div>

      {!valide ? (
        <button
          type="button"
          disabled={!complet}
          onClick={() => setValide(true)}
          className="mt-8 rounded-md bg-chalk-yellow px-5 py-2 text-sm font-medium text-board disabled:cursor-not-allowed disabled:opacity-40"
        >
          Corriger
        </button>
      ) : (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="font-display text-lg">
            Score : {score} / {total}
          </p>
          {sheetUrl && !envoye && (
            <button
              type="button"
              onClick={envoyerFeedback}
              className="rounded-md border border-chalk/30 px-4 py-2 text-sm hover:border-chalk-yellow"
            >
              Envoyer mon score au professeur
            </button>
          )}
          {envoye && <p className="text-sm text-chalk-blue">Score envoyé, merci.</p>}
        </div>
      )}
    </div>
  );
}
