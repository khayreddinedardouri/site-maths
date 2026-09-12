"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "maths-chatbot-messages-v1";

type Source = {
  chapitreTitre: string;
  partieTitre: string | null;
  sectionTitre: string | null;
  sectionNum: string | null;
  url: string;
};

type Message = {
  role: "user" | "assistant";
  texte: string;
  sources?: Source[];
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignorer les erreurs d'écriture locale si le navigateur refuse le stockage.
    }
  }, [loaded, messages]);

  async function envoyer() {
    const q = question.trim();
    if (!q || enCours) return;

    setMessages((m) => [...m, { role: "user", texte: q }]);
    setQuestion("");
    setEnCours(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        cache: "no-store",
      });

      if (!res.ok) {
        const texteErreur = await res.text();
        throw new Error(`${res.status} ${texteErreur || "Erreur API"}`);
      }

      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          texte: data.reponse ?? data.erreur ?? "Erreur inconnue.",
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", texte: "Une erreur est survenue, réessaie." },
      ]);
    } finally {
      setEnCours(false);
    }
  }

  function effacerHistorique() {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorer les erreurs d'écriture locale si le navigateur refuse le stockage.
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-board/15 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg">Pose ta question sur le cours</h2>
        <button
          type="button"
          onClick={effacerHistorique}
          className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 transition hover:bg-pink-100"
        >
          Effacer l’historique du navigateur
        </button>
      </div>

      <p className="text-xs text-ink/60">Historique conservé sur ce navigateur.</p>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "self-end text-right" : "self-start"}>
            <p className="whitespace-pre-wrap rounded-lg bg-board/5 px-3 py-2 text-sm">
              {m.texte}
            </p>
            {m.sources && m.sources.length > 0 && (
              <ul className="mt-1 space-y-1 text-xs">
                {m.sources.map((s, j) => (
                  <li key={j}>
                    <a href={s.url} className="text-board-light chalk-underline hover:text-chalk-coral">
                      📍 {s.chapitreTitre}
                      {s.sectionTitre ? ` — ${s.sectionNum} ${s.sectionTitre}` : ""}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {enCours && <p className="text-xs italic text-ink/50">L'assistant réfléchit…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          placeholder="Ex : comment dérive-t-on e^(u(x)) ?"
          className="flex-1 rounded-lg border border-board/15 px-3 py-2 text-sm"
        />
        <button
          onClick={envoyer}
          disabled={enCours}
          className="rounded-lg bg-[#001f3f] hover:bg-[#00284f] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}