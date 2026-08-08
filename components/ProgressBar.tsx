"use client";

import { useProgress } from "./ProgressContext";

export default function ProgressBar() {
  const { totalQuestions, percent, quizzesDone } = useProgress();

  if (totalQuestions === 0) return null;

  return (
    <div className="sticky top-[73px] z-20 -mx-6 mb-8 border-b border-pink-100 bg-white/80 px-6 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-sky-600">
          Ta progression
        </span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-sky-400 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-bold text-ink/70">
          {percent}% · {quizzesDone} quiz fait{quizzesDone > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}