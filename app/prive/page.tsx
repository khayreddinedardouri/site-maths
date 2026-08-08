"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrivePage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function accéder(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/prive/${encodeURIComponent(code.trim())}`);
  }

  return (
    <div className="paper-grid flex min-h-[70vh] items-center justify-center px-6">
      <form onSubmit={accéder} className="w-full max-w-sm rounded-lg bg-board p-8 text-chalk">
        <p className="font-mono text-xs uppercase tracking-widest text-chalk/60">
          Examen dédié
        </p>
        <h1 className="mt-2 font-display text-2xl">Entrez votre code</h1>
        <p className="mt-2 text-sm text-chalk/70">
          Le code vous a été communiqué par votre professeur.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex. LEA-2026-07"
          autoFocus
          className="mt-6 w-full rounded-md border border-chalk/25 bg-board-light px-4 py-3 text-sm text-chalk outline-none placeholder:text-chalk/40 focus:border-chalk-yellow"
        />

        <button
          type="submit"
          disabled={!code.trim()}
          className="mt-4 w-full rounded-md bg-chalk-yellow px-5 py-2 text-sm font-medium text-board disabled:cursor-not-allowed disabled:opacity-40"
        >
          Accéder à mon examen
        </button>
      </form>
    </div>
  );
}
