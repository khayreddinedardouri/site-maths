"use client";

import { useMemo, useState } from "react";

export default function ExponentialExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [x, setX] = useState(0);

  const values = useMemo(() => {
    const f = Math.exp(a * x + b);
    const fPrime = a * f;
    const variation = a > 0 ? "croissante" : a < 0 ? "décroissante" : "constante";

    return {
      f,
      fPrime,
      variation,
      signe: f > 0 ? "toujours positive" : "nulle ou négative",
      point: `f(${x.toFixed(1)}) = ${f.toFixed(3)}`,
      derivee: `f'(${x.toFixed(1)}) = ${fPrime.toFixed(3)}`,
    };
  }, [a, b, x]);

  return (
    <div className="not-prose my-8 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-pink-50 p-5 shadow-sm shadow-sky-100">
      <p className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-pink-400 text-sm text-white">
          ✦
        </span>
        Explorer la fonction exponentielle
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4 rounded-xl border border-sky-100 bg-white/70 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/60">
              Coefficient a
            </label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="mt-1 text-sm text-ink/70">a = {a.toFixed(1)}</div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/60">
              Décalage b
            </label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="mt-1 text-sm text-ink/70">b = {b.toFixed(1)}</div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/60">
              Variable x
            </label>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
            <div className="mt-1 text-sm text-ink/70">x = {x.toFixed(1)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-pink-100 bg-white/80 p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Fonction étudiée
          </div>

          <div className="rounded-lg bg-sky-50 p-3 font-mono text-sm text-sky-700">
            f(x) = e^(a x + b) = e^({a * x + b >= 0 ? `(${a * x + b})` : `(${a * x + b})`})
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
              <div className="text-xs uppercase tracking-wider text-sky-600">f(x)</div>
              <div className="mt-1 font-mono text-lg font-semibold text-sky-700">
                {values.f.toFixed(3)}
              </div>
            </div>

            <div className="rounded-lg border border-pink-200 bg-pink-50 p-3">
              <div className="text-xs uppercase tracking-wider text-pink-600">f'(x)</div>
              <div className="mt-1 font-mono text-lg font-semibold text-pink-700">
                {values.fPrime.toFixed(3)}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <p>
              <span className="font-semibold text-ink">Signe :</span> {values.signe}
            </p>
            <p>
              <span className="font-semibold text-ink">Variation :</span> {values.variation}
            </p>
            <p>
              <span className="font-semibold text-ink">Point :</span> {values.point}
            </p>
            <p>
              <span className="font-semibold text-ink">Dérivée :</span> {values.derivee}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            💡 Pour la fonction exponentielle classique, on a a = 1 et b = 0, donc f(x) = e^x.
            Sa dérivée est toujours égale à la fonction elle-même : f'(x) = e^x.
          </div>
        </div>
      </div>
    </div>
  );
}
