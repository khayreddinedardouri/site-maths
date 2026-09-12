"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type QuizResult = { correct: number; total: number };
type ProgressState = Record<string, QuizResult>;

export type ChapterProgressSummary = {
  key: string;
  niveau: string;
  chapitre: string;
  titre: string;
  totalCorrect: number;
  totalQuestions: number;
  percent: number;
  quizzesDone: number;
  updatedAt: number;
};

type ProgressContextValue = {
  registerResult: (quizId: string, correct: number, total: number) => void;
  totalCorrect: number;
  totalQuestions: number;
  percent: number;
  quizzesDone: number;
};

const STORAGE_PREFIX = "maths-chapter-progress:";

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readSavedProgress(key: string): ProgressState {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as { state?: ProgressState };
    return parsed.state ?? {};
  } catch {
    return {};
  }
}

/**
 * Enveloppe une page de cours pour suivre le score des <MiniQuiz /> qu'elle contient.
 * Chaque MiniQuiz appelle registerResult() une fois corrigé.
 */
export function ProgressProvider({
  children,
  chapterKey,
  chapterTitle,
}: {
  children: React.ReactNode;
  chapterKey?: string;
  chapterTitle?: string;
}) {
  const [state, setState] = useState<ProgressState>({});

  useEffect(() => {
    if (!chapterKey) return;
    setState(readSavedProgress(chapterKey));
  }, [chapterKey]);

  useEffect(() => {
    if (!chapterKey || !chapterTitle) return;

    const totalCorrect = Object.values(state).reduce((sum, entry) => sum + entry.correct, 0);
    const totalQuestions = Object.values(state).reduce((sum, entry) => sum + entry.total, 0);

    const summary: ChapterProgressSummary = {
      key: chapterKey,
      niveau: chapterKey.split("/")[0],
      chapitre: chapterKey.split("/")[1],
      titre: chapterTitle,
      totalCorrect,
      totalQuestions,
      percent: totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100),
      quizzesDone: Object.keys(state).length,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(`${STORAGE_PREFIX}${chapterKey}`, JSON.stringify({ state, summary }));
  }, [chapterKey, chapterTitle, state]);

  const registerResult = useCallback((quizId: string, correct: number, total: number) => {
    setState((prev) => ({ ...prev, [quizId]: { correct, total } }));
  }, []);

  const { totalCorrect, totalQuestions, quizzesDone } = useMemo(() => {
    const values = Object.values(state);
    return {
      totalCorrect: values.reduce((a, v) => a + v.correct, 0),
      totalQuestions: values.reduce((a, v) => a + v.total, 0),
      quizzesDone: values.length,
    };
  }, [state]);

  const percent = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <ProgressContext.Provider value={{ registerResult, totalCorrect, totalQuestions, percent, quizzesDone }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress doit être utilisé à l'intérieur d'un <ProgressProvider>");
  return ctx;
}

export function getSavedChapterProgress(): ChapterProgressSummary[] {
  if (typeof window === "undefined") return [];

  const entries: ChapterProgressSummary[] = [];

  for (const key of Object.keys(window.localStorage)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as { summary?: ChapterProgressSummary };
      if (parsed.summary) entries.push(parsed.summary);
    } catch {
      continue;
    }
  }

  return entries.sort((a, b) => b.updatedAt - a.updatedAt);
}