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
      <form
        onSubmit={accéder}
        className="w-full max-w-sm rounded-2xl border-2 border-[#111114] bg-gradient-to-br from-[#F6D68A] to-[#E8B94B] p-8 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-[#111114]/40" />
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#111114]/70">
            Examen dédié
          </p>
          <span className="h-px flex-1 bg-[#111114]/40" />
        </div>

        <h1 className="mt-4 text-center font-display text-2xl font-semibold text-[#111114]">
          Entrez votre code
        </h1>
        <p className="mt-2 text-center text-sm text-[#111114]/70">
          Le code vous a été communiqué par votre professeur.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex. LEA-2026-07"
          autoFocus
          className="mt-6 w-full rounded-lg border-2 border-[#111114]/70 bg-[#F6D68A]/40 px-4 py-3 text-center text-sm text-[#111114] outline-none placeholder:text-[#111114]/40 transition-colors focus:border-[#111114] focus:bg-white/60"
        />

        <button
          type="submit"
          disabled={!code.trim()}
          className="mt-4 w-full rounded-lg border-2 border-[#111114] bg-[#111114] px-5 py-3 text-sm font-semibold text-[#F6D68A] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Accéder à mon examen
        </button>
      </form>
    </div>
  );
}