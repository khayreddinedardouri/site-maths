"use client";

import { useState } from "react";
import { useProgress } from "./ProgressContext";

type Question = {
  question: string;
  choix: string[];
  reponse: number;
  explication: string;
};

export default function MiniQuiz({
  id,
  titre = "Mini-quiz éclair ⚡",
  questions = [],
}: {
  id: string;
  titre?: string;
  questions?: Question[];
}) {
  const { registerResult } = useProgress();
  const [reponses, setReponses] = useState<Record<number, number>>({});
  const [valide, setValide] = useState(false);

  if (!questions || questions.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`MiniQuiz "${id}" : aucune question fournie, le quiz n'est pas affiché.`);
    }
    return null;
  }

  const total = questions.length;
  const complet = Object.keys(reponses).length === total;
  const score = questions.reduce((acc, q, i) => acc + (reponses[i] === q.reponse ? 1 : 0), 0);
  const bienJoue = score === total;

  function choisir(qi: number, ci: number) {
    if (valide) return;
    setReponses((prev) => ({ ...prev, [qi]: ci }));
  }

  function corriger() {
    setValide(true);
    registerResult(id, score, total);
  }

  return (
    <div className="not-prose my-8 animate-pop-in rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-white to-sky-50 p-5 shadow-sm shadow-pink-100">
      <p className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-sky-400 text-sm text-white">
          ?
        </span>
        {titre}
      </p>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-medium text-ink/80">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {q.choix.map((c, ci) => {
                const selectionne = reponses[qi] === ci;
                const estCorrecte = ci === q.reponse;
                let etat = "border-pink-200 bg-white hover:border-sky-300 hover:bg-sky-50";
                if (valide && selectionne) {
                  etat = estCorrecte
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-pink-400 bg-pink-50 text-pink-700";
                } else if (valide && estCorrecte) {
                  etat = "border-sky-300/70";
                } else if (selectionne) {
                  etat = "border-fuchsia-400 bg-fuchsia-50";
                }
                return (
                  <button
                    key={ci}
                    type="button"
                    disabled={valide}
                    onClick={() => choisir(qi, ci)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 ${etat}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {valide && <p className="mt-1.5 text-xs text-ink/60">💡 {q.explication}</p>}
          </div>
        ))}
      </div>

      {!valide ? (
        <button
          type="button"
          disabled={!complet}
          onClick={corriger}
          className="mt-5 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Vérifier mes réponses
        </button>
      ) : (
        <p className={`mt-5 text-sm font-semibold ${bienJoue ? "text-sky-600" : "text-ink/70"}`}>
          {bienJoue
            ? "🎉 Parfait, tu maîtrises ce point ! On continue."
            : `Score : ${score}/${total} — relis l'explication ci-dessus et poursuis le cours.`}
        </p>
      )}
    </div>
  );
}