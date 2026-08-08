"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type QuizResult = { correct: number; total: number };
type ProgressState = Record<string, QuizResult>;

type ProgressContextValue = {
  registerResult: (quizId: string, correct: number, total: number) => void;
  totalCorrect: number;
  totalQuestions: number;
  percent: number;
  quizzesDone: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

/**
 * Enveloppe une page de cours pour suivre le score des <MiniQuiz /> qu'elle contient.
 * Chaque MiniQuiz appelle registerResult() une fois corrigé.
 */
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({});

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