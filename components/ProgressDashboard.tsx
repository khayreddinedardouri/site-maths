"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedChapterProgress, type ChapterProgressSummary } from "@/components/ProgressContext";

export default function ProgressDashboard() {
  const [items, setItems] = useState<ChapterProgressSummary[]>([]);

  useEffect(() => {
    setItems(getSavedChapterProgress());
  }, []);

  return (
    <div className="rounded-3xl border border-pink-200 bg-white/80 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Mon tableau de bord</p>
          <h2 className="mt-2 font-display text-2xl text-ink">Progression de mes chapitres</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-pink-200 bg-pink-50/60 p-6 text-sm text-ink/70">
          Tu n’as encore fait aucun quiz sur les chapitres. Commence par ouvrir un cours et valide un mini-quiz.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.key} className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-sky-600">
                    {item.niveau === "1ere" ? "1ère générale" : "Terminale"}
                  </p>
                  <Link
                    href={`/${item.niveau}/${item.chapitre}`}
                    className="mt-1 inline-block font-display text-lg font-semibold text-ink hover:text-pink-500"
                  >
                    {item.titre}
                  </Link>
                </div>

                <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-sky-700">
                  {item.percent}%
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-pink-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-sky-400"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-ink/70">
                  {item.quizzesDone} quiz{item.quizzesDone > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-3 text-xs text-ink/60">
                {item.totalCorrect}/{item.totalQuestions} bonnes réponses
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
