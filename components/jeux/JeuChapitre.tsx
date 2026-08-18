"use client";

import { useState } from "react";
import type { CourbeKey, Jeu, JeuQuestionCalcul } from "@/lib/jeux/types";

const VIES_DEPART = 3;

function normaliser(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "").replace(",", ".");
}

const COURBE_PATHS: Record<CourbeKey, string> = {
  "exp-croissante": "M 5 76 Q 30 74 50 66 Q 70 55 84 36 Q 94 20 99 6",
  "exp-decroissante": "M 5 6 Q 16 22 26 38 Q 40 55 60 66 Q 80 74 99 76",
  "droite-croissante": "M 5 78 L 99 5",
  parabole: "M 5 14 Q 52 92 99 14",
  "log-croissante": "M 8 78 Q 22 28 52 16 Q 74 10 99 6",
  constante: "M 5 40 L 99 40",
};

function MiniCourbe({ type }: { type: CourbeKey }) {
  return (
    <svg viewBox="0 0 104 84" className="h-16 w-full sm:h-20">
      <line x1="0" y1="42" x2="104" y2="42" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
      <line x1="18" y1="0" x2="18" y2="84" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
      <path
        d={COURBE_PATHS[type]}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-sky-500"
      />
    </svg>
  );
}

function Coeurs({ vies }: { vies: number }) {
  return (
    <div className="flex gap-1 text-lg" aria-label={`${vies} vies restantes`}>
      {Array.from({ length: VIES_DEPART }).map((_, i) => (
        <span key={i} className={i < vies ? "opacity-100" : "opacity-20 grayscale"}>
          ❤️
        </span>
      ))}
    </div>
  );
}

export default function JeuChapitre({ jeu }: { jeu: Jeu }) {
  const [index, setIndex] = useState(0);
  const [vies, setVies] = useState(VIES_DEPART);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [derniereCorrecte, setDerniereCorrecte] = useState(false);
  const [selection, setSelection] = useState<number | boolean | string | null>(null);
  const [saisie, setSaisie] = useState("");
  const [statut, setStatut] = useState<"jeu" | "perdu" | "gagne">("jeu");

  if (!jeu || jeu.questions.length === 0) return null;

  const total = jeu.questions.length;
  const question = jeu.questions[index];

  function repondre(estCorrecte: boolean, valeur: number | boolean | string) {
    if (phase !== "question") return;
    setSelection(valeur);
    setDerniereCorrecte(estCorrecte);
    setPhase("feedback");
    if (estCorrecte) {
      setScore((s) => s + 1);
    } else {
      setVies((v) => {
        const nv = v - 1;
        if (nv <= 0) setStatut("perdu");
        return nv;
      });
    }
  }

  function validerCalcul() {
    if (!saisie.trim() || phase !== "question") return;
    const q = question as JeuQuestionCalcul;
    const correcte = q.reponsesAcceptees.map(normaliser).includes(normaliser(saisie));
    repondre(correcte, saisie);
  }

  function suivant() {
    if (index === total - 1) {
      setStatut("gagne");
      return;
    }
    setIndex((i) => i + 1);
    setPhase("question");
    setSelection(null);
    setSaisie("");
  }

  function rejouer() {
    setIndex(0);
    setVies(VIES_DEPART);
    setScore(0);
    setPhase("question");
    setSelection(null);
    setSaisie("");
    setStatut("jeu");
  }

  // --- Écran de fin : partie perdue ---
  if (statut === "perdu") {
    return (
      <div className="not-prose mt-10 animate-pop-in rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 text-center shadow-sm shadow-pink-100 sm:p-8">
        <p className="text-3xl">💔</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">Partie terminée</h2>
        <p className="mt-2 text-sm text-ink/60">
          Tu as répondu correctement à <strong>{score}</strong> question{score > 1 ? "s" : ""} sur{" "}
          {total} avant de perdre tes 3 vies.
        </p>
        <p className="mt-1 text-sm text-ink/60">Relis le cours et retente ta chance !</p>
        <button
          type="button"
          onClick={rejouer}
          className="mt-6 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 px-6 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
        >
          🔄 Rejouer
        </button>
      </div>
    );
  }

  // --- Écran de fin : partie gagnée ---
  if (statut === "gagne") {
    const parfait = score === total;
    return (
      <div className="not-prose mt-10 animate-pop-in rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 text-center shadow-sm shadow-pink-100 sm:p-8">
        <p className="text-3xl">{parfait ? "🏆" : "🎉"}</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">
          {parfait ? "Sans faute !" : "Jeu terminé !"}
        </h2>
        <p className="mt-2 font-display text-2xl text-transparent bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text">
          {score} / {total}
        </p>
        <p className="mt-2 text-sm text-ink/60">
          {parfait
            ? "Tu maîtrises parfaitement ce chapitre."
            : "Bien joué — relis les points ratés si besoin puis retente le sans-faute."}
        </p>
        <button
          type="button"
          onClick={rejouer}
          className="mt-6 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 px-6 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
        >
          🔄 Rejouer
        </button>
      </div>
    );
  }

  // --- Écran de jeu ---
  return (
    <div className="not-prose mt-10 animate-pop-in rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 shadow-sm shadow-pink-100 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {jeu.titre} · {index + 1}/{total}
        </p>
        <Coeurs vies={vies} />
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{question.question}</h3>

      {/* QCM */}
      {question.type === "qcm" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.choix.map((c, ci) => {
            const estCorrecte = ci === question.reponse;
            const selectionne = selection === ci;
            let etat = "border-pink-200 bg-white hover:border-sky-300 hover:bg-sky-50";
            if (phase === "feedback") {
              if (selectionne) etat = estCorrecte ? "border-sky-400 bg-sky-50 text-sky-700" : "border-pink-400 bg-pink-50 text-pink-700";
              else if (estCorrecte) etat = "border-sky-300/70";
            }
            return (
              <button
                key={ci}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => repondre(estCorrecte, ci)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 ${etat}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Vrai / Faux */}
      {question.type === "vrai_faux" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[true, false].map((val) => {
            const estCorrecte = val === question.reponse;
            const selectionne = selection === val;
            let etat = "border-pink-200 bg-white hover:border-sky-300 hover:bg-sky-50";
            if (phase === "feedback") {
              if (selectionne) etat = estCorrecte ? "border-sky-400 bg-sky-50 text-sky-700" : "border-pink-400 bg-pink-50 text-pink-700";
              else if (estCorrecte) etat = "border-sky-300/70";
            }
            return (
              <button
                key={String(val)}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => repondre(estCorrecte, val)}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-150 ${etat}`}
              >
                {val ? "✅ Vrai" : "❌ Faux"}
              </button>
            );
          })}
        </div>
      )}

      {/* Calcul à taper */}
      {question.type === "calcul" && (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validerCalcul()}
              disabled={phase === "feedback"}
              placeholder={question.placeholder ?? "Ta réponse..."}
              className="w-full rounded-lg border border-pink-200 bg-white px-4 py-2 text-sm text-ink outline-none focus:border-sky-400 disabled:opacity-60"
            />
            {phase === "question" && (
              <button
                type="button"
                onClick={validerCalcul}
                disabled={!saisie.trim()}
                className="shrink-0 rounded-lg bg-gradient-to-r from-pink-400 to-sky-400 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Valider
              </button>
            )}
          </div>
          {phase === "feedback" && (
            <p className={`mt-2 text-sm font-medium ${derniereCorrecte ? "text-sky-600" : "text-pink-600"}`}>
              {derniereCorrecte
                ? "✅ Exact !"
                : `❌ Ta réponse : « ${saisie} » — bonne réponse : ${question.reponsesAcceptees[0]}`}
            </p>
          )}
        </div>
      )}

      {/* Clic sur la courbe */}
      {question.type === "clic_courbe" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {question.courbes.map((key) => {
            const estCorrecte = key === question.reponse;
            const selectionne = selection === key;
            let etat = "border-pink-200 bg-white hover:border-sky-300 hover:bg-sky-50";
            if (phase === "feedback") {
              if (selectionne) etat = estCorrecte ? "border-sky-400 bg-sky-50" : "border-pink-400 bg-pink-50";
              else if (estCorrecte) etat = "border-sky-300/70";
            }
            return (
              <button
                key={key}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => repondre(estCorrecte, key)}
                className={`rounded-lg border p-2 transition-all duration-150 ${etat}`}
              >
                <MiniCourbe type={key} />
              </button>
            );
          })}
        </div>
      )}

      {/* Explication + bouton suivant */}
      {phase === "feedback" && (
        <div className="mt-4 border-t border-pink-100 pt-4">
          {question.type !== "calcul" && (
            <p className={`text-sm font-medium ${derniereCorrecte ? "text-sky-600" : "text-pink-600"}`}>
              {derniereCorrecte ? "✅ Bonne réponse !" : "❌ Pas tout à fait."}
            </p>
          )}
          <p className="mt-1 text-xs text-ink/60">💡 {question.explication}</p>
          <button
            type="button"
            onClick={suivant}
            className="mt-4 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
          >
            {index === total - 1 ? "Voir mon score →" : "Question suivante →"}
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-ink/40">Score actuel : {score}/{total}</p>
    </div>
  );
}