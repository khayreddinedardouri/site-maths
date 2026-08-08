"use client";

import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Petit analyseur d'expressions mathématiques, sans eval()/Function() */
/*  Supporte : + - * / ^, parenthèses, sin cos tan sqrt abs exp ln log */
/*  et les variables autorisées passées en paramètre (ex: "x", "n").   */
/* ------------------------------------------------------------------ */

type EvalFn = (vars: Record<string, number>) => number;

const CONSTANTES: Record<string, number> = { pi: Math.PI, e: Math.E };
const FONCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
};

class ParseError extends Error {}

function tokenize(src: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push(src.slice(i, j));
      i = j;
    } else if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z_0-9]/.test(src[j])) j++;
      tokens.push(src.slice(i, j));
      i = j;
    } else if ("+-*/^(),".includes(c)) {
      tokens.push(c);
      i++;
    } else {
      throw new ParseError(`Caractère inattendu : "${c}"`);
    }
  }
  return tokens;
}

/** Compile une expression en fonction évaluable. Lève ParseError si invalide. */
function compileExpression(src: string, allowedVars: string[]): EvalFn {
  const tokens = tokenize(src);
  let pos = 0;

  function peek() {
    return tokens[pos];
  }
  function next() {
    return tokens[pos++];
  }

  function parseExpr(): EvalFn {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const right = parseTerm();
      const prevLeft = left;
      left = (v) => (op === "+" ? prevLeft(v) + right(v) : prevLeft(v) - right(v));
    }
    return left;
  }

  function parseTerm(): EvalFn {
    let left = parseUnary();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const right = parseUnary();
      const prevLeft = left;
      left = (v) => (op === "*" ? prevLeft(v) * right(v) : prevLeft(v) / right(v));
    }
    return left;
  }

  function parseUnary(): EvalFn {
    if (peek() === "-") {
      next();
      const inner = parseUnary();
      return (v) => -inner(v);
    }
    if (peek() === "+") {
      next();
      return parseUnary();
    }
    return parsePow();
  }

  function parsePow(): EvalFn {
    const base = parsePrimary();
    if (peek() === "^") {
      next();
      const exponent = parseUnary(); // right-associatif
      return (v) => Math.pow(base(v), exponent(v));
    }
    return base;
  }

  function parsePrimary(): EvalFn {
    const tok = peek();
    if (tok === undefined) throw new ParseError("Expression incomplète");

    if (tok === "(") {
      next();
      const inner = parseExpr();
      if (next() !== ")") throw new ParseError("Parenthèse fermante manquante");
      return inner;
    }

    if (/^[0-9.]/.test(tok)) {
      next();
      const num = parseFloat(tok);
      if (Number.isNaN(num)) throw new ParseError(`Nombre invalide : "${tok}"`);
      return () => num;
    }

    if (/^[a-zA-Z_]/.test(tok)) {
      next();
      // Appel de fonction : nom(...)
      if (peek() === "(") {
        next();
        const args: EvalFn[] = [parseExpr()];
        while (peek() === ",") {
          next();
          args.push(parseExpr());
        }
        if (next() !== ")") throw new ParseError("Parenthèse fermante manquante");
        const fn = FONCTIONS[tok];
        if (!fn) throw new ParseError(`Fonction inconnue : "${tok}"`);
        const arg0 = args[0];
        return (v) => fn(arg0(v));
      }
      if (allowedVars.includes(tok)) {
        return (v) => v[tok];
      }
      if (tok in CONSTANTES) {
        const val = CONSTANTES[tok];
        return () => val;
      }
      throw new ParseError(`Symbole inconnu : "${tok}" (variables autorisées : ${allowedVars.join(", ")})`);
    }

    throw new ParseError(`Jeton inattendu : "${tok}"`);
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new ParseError("Expression mal formée");
  return result;
}

/* ------------------------------------------------------------------ */
/*  Intégration GeoGebra                                               */
/* ------------------------------------------------------------------ */

/** Construit l'URL GeoGebra Graphing Calculator avec la fonction pré-remplie. */
function buildGeoGebraUrl(expr: string): string {
  const commande = `f(x)=${expr}`;
  const params = new URLSearchParams({ command: commande });
  return `https://www.geogebra.org/calculator?${params.toString()}`;
}

/** Aperçu GeoGebra intégré (iframe), affiché à la demande. */
function GeoGebraViewer({ url }: { url: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-board/20">
      <iframe key={url} src={url} title="GeoGebra" className="h-[480px] w-full" allow="fullscreen" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

type Mode = "fonction" | "suite";

const LARGEUR = 640;
const HAUTEUR = 420;
const MARGE = 30;

export default function GraphingTool() {
  const [mode, setMode] = useState<Mode>("fonction");

  return (
    <div className="rounded-lg border border-board/15 bg-white p-4 sm:p-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("fonction")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "fonction" ? "bg-board text-chalk" : "bg-board/5 text-ink/70 hover:bg-board/10"
          }`}
        >
          Tracer une fonction f(x)
        </button>
        <button
          onClick={() => setMode("suite")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "suite" ? "bg-board text-chalk" : "bg-board/5 text-ink/70 hover:bg-board/10"
          }`}
        >
          Étudier une suite uₙ₊₁ = f(uₙ)
        </button>
      </div>

      <div className="mt-6">{mode === "fonction" ? <ModeFonction /> : <ModeSuite />}</div>
    </div>
  );
}

/* ---------------------------- Mode fonction ---------------------------- */

function ModeFonction() {
  const [expr, setExpr] = useState("x^2 - 3*x + 1");
  const [xmin, setXmin] = useState(-5);
  const [xmax, setXmax] = useState(5);
  const [erreur, setErreur] = useState<string | null>(null);
  const [voirGeoGebra, setVoirGeoGebra] = useState(false);

  const points = useMemo(() => {
    setErreur(null);
    try {
      const f = compileExpression(expr, ["x"]);
      const n = 300;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= n; i++) {
        const x = xmin + ((xmax - xmin) * i) / n;
        const y = f({ x });
        if (Number.isFinite(y)) pts.push({ x, y });
      }
      return pts;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur d'analyse");
      return [];
    }
  }, [expr, xmin, xmax]);

  const ymin = points.length ? Math.max(-1000, Math.min(...points.map((p) => p.y))) : -5;
  const ymax = points.length ? Math.min(1000, Math.max(...points.map((p) => p.y))) : 5;

  const geoGebraUrl = useMemo(() => buildGeoGebraUrl(expr), [expr]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">f(x) =</span>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="mt-1 w-full rounded-md border border-board/20 px-3 py-2 font-mono text-sm outline-none focus:border-chalk-yellow"
            placeholder="ex : sin(x) + x^2/4, exp(-x), ln(x)..."
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">x min</span>
          <input
            type="number"
            value={xmin}
            onChange={(e) => setXmin(parseFloat(e.target.value))}
            className="mt-1 w-24 rounded-md border border-board/20 px-3 py-2 text-sm outline-none focus:border-chalk-yellow"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">x max</span>
          <input
            type="number"
            value={xmax}
            onChange={(e) => setXmax(parseFloat(e.target.value))}
            className="mt-1 w-24 rounded-md border border-board/20 px-3 py-2 text-sm outline-none focus:border-chalk-yellow"
          />
        </label>
      </div>

      {erreur && <p className="mt-2 text-sm text-chalk-coral">{erreur}</p>}

      <div className="mt-4 overflow-x-auto">
        <PlotSVG curves={[{ points, couleur: "#2C4E45" }]} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setVoirGeoGebra((v) => !v)}
          className="rounded-md bg-board px-4 py-2 text-sm font-medium text-chalk hover:bg-board-light"
        >
          {voirGeoGebra ? "Masquer GeoGebra" : "Voir dans GeoGebra ↗"}
        </button>
        <a
          href={geoGebraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-board/20 px-4 py-2 text-sm text-ink/70 hover:border-chalk-yellow hover:text-ink"
        >
          Ouvrir dans un nouvel onglet
        </a>
      </div>

      {voirGeoGebra && <GeoGebraViewer url={geoGebraUrl} />}

      <p className="mt-2 text-xs text-ink/50">
        Fonctions disponibles : sin cos tan asin acos atan sqrt abs exp ln log — constantes : pi, e.
      </p>
    </div>
  );
}

/* ----------------------------- Mode suite ------------------------------ */

function ModeSuite() {
  const [expr, setExpr] = useState("0.5*u + 2");
  const [u0, setU0] = useState(0);
  const [nMax, setNMax] = useState(15);
  const [erreur, setErreur] = useState<string | null>(null);

  const { termes, cobweb, xmin, xmax } = useMemo(() => {
    setErreur(null);
    try {
      const f = compileExpression(expr, ["u"]);
      const termes: number[] = [u0];
      for (let i = 0; i < nMax; i++) {
        const suivant = f({ u: termes[termes.length - 1] });
        termes.push(suivant);
        if (!Number.isFinite(suivant) || Math.abs(suivant) > 1e6) break;
      }

      const escalier: { x: number; y: number }[] = [{ x: termes[0], y: termes[0] }];
      for (let i = 0; i < termes.length - 1; i++) {
        escalier.push({ x: termes[i], y: termes[i + 1] });
        escalier.push({ x: termes[i + 1], y: termes[i + 1] });
      }

      const bornes = termes.filter((t) => Number.isFinite(t));
      const lo = Math.min(...bornes, 0);
      const hi = Math.max(...bornes, 0);
      const marge = Math.max(1, (hi - lo) * 0.2);

      return { termes, cobweb: escalier, xmin: lo - marge, xmax: hi + marge };
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur d'analyse");
      return { termes: [u0], cobweb: [], xmin: -1, xmax: 1 };
    }
  }, [expr, u0, nMax]);

  const courbeF = useMemo(() => {
    try {
      const f = compileExpression(expr, ["u"]);
      const n = 200;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= n; i++) {
        const x = xmin + ((xmax - xmin) * i) / n;
        const y = f({ u: x });
        if (Number.isFinite(y)) pts.push({ x, y });
      }
      return pts;
    } catch {
      return [];
    }
  }, [expr, xmin, xmax]);

  const droiteIdentite = [
    { x: xmin, y: xmin },
    { x: xmax, y: xmax },
  ];

  return (
    <div>
      <p className="text-sm text-ink/60">
        On étudie la suite définie par récurrence <code className="font-mono">u(n+1) = f(u(n))</code>. Écrivez f en
        fonction de la variable <code className="font-mono">u</code>.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">f(u) =</span>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="mt-1 w-full rounded-md border border-board/20 px-3 py-2 font-mono text-sm outline-none focus:border-chalk-yellow"
            placeholder="ex : 0.5*u + 2, sqrt(u+2), 3-u^2..."
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">u₀</span>
          <input
            type="number"
            value={u0}
            onChange={(e) => setU0(parseFloat(e.target.value))}
            className="mt-1 w-24 rounded-md border border-board/20 px-3 py-2 text-sm outline-none focus:border-chalk-yellow"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink/50">Nombre de termes</span>
          <input
            type="number"
            min={2}
            max={60}
            value={nMax}
            onChange={(e) => setNMax(Math.max(2, Math.min(60, parseInt(e.target.value) || 2)))}
            className="mt-1 w-24 rounded-md border border-board/20 px-3 py-2 text-sm outline-none focus:border-chalk-yellow"
          />
        </label>
      </div>

      {erreur && <p className="mt-2 text-sm text-chalk-coral">{erreur}</p>}

      <div className="mt-4 overflow-x-auto">
        <PlotSVG
          curves={[
            { points: courbeF, couleur: "#2C4E45", label: "y = f(x)" },
            { points: droiteIdentite, couleur: "#D9784A", label: "y = x" },
            { points: cobweb, couleur: "#7FB0BC", label: "trajectoire de la suite" },
          ]}
          xmin={xmin}
          xmax={xmax}
          ymin={xmin}
          ymax={xmax}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-ink/50">Valeurs calculées</p>
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
          {termes.slice(0, 12).map((t, i) => (
            <span key={i} className="rounded bg-board/5 px-2 py-1">
              u{i} = {Number.isFinite(t) ? t.toFixed(3) : "∞"}
            </span>
          ))}
          {termes.length > 12 && <span className="px-2 py-1 text-ink/40">…</span>}
        </div>
      </div>
      <p className="mt-3 text-xs text-ink/50">
        La courbe verte trace f, la droite orange trace y = x, et la ligne bleue est la "toile d'araignée" : elle
        relie u₀ sur l'axe des x à f(u₀), puis redescend sur y = x pour retrouver u₁, etc. Si la trajectoire se
        rapproche d'un point d'intersection entre f et y = x, la suite converge vers ce point fixe.
      </p>
    </div>
  );
}

/* ------------------------------- SVG plot ------------------------------- */

function PlotSVG({
  curves,
  xmin,
  xmax,
  ymin,
  ymax,
}: {
  curves: { points: { x: number; y: number }[]; couleur: string; label?: string }[];
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}) {
  const w = LARGEUR - 2 * MARGE;
  const h = HAUTEUR - 2 * MARGE;

  const sx = (x: number) => MARGE + ((x - xmin) / (xmax - xmin || 1)) * w;
  const sy = (y: number) => MARGE + h - ((y - ymin) / (ymax - ymin || 1)) * h;

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.length === 0 ? "" : "M " + pts.map((p) => `${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" L ");

  const axeXy = ymin <= 0 && ymax >= 0 ? sy(0) : null;
  const axeYx = xmin <= 0 && xmax >= 0 ? sx(0) : null;

  return (
    <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} className="w-full min-w-[420px] max-w-2xl" role="img">
      <rect x={0} y={0} width={LARGEUR} height={HAUTEUR} fill="#FAF9F4" />
      {axeXy !== null && (
        <line x1={MARGE} y1={axeXy} x2={LARGEUR - MARGE} y2={axeXy} stroke="#1C1C1A" strokeOpacity={0.3} />
      )}
      {axeYx !== null && (
        <line x1={axeYx} y1={MARGE} x2={axeYx} y2={HAUTEUR - MARGE} stroke="#1C1C1A" strokeOpacity={0.3} />
      )}
      <rect x={MARGE} y={MARGE} width={w} height={h} fill="none" stroke="#1C1C1A" strokeOpacity={0.15} />

      {curves.map((c, i) => (
        <path key={i} d={toPath(c.points)} fill="none" stroke={c.couleur} strokeWidth={2} />
      ))}

      <text x={MARGE} y={HAUTEUR - 6} className="fill-ink/50" fontSize={10}>
        x: [{xmin.toFixed(1)} ; {xmax.toFixed(1)}]
      </text>
      <text x={LARGEUR - MARGE - 90} y={HAUTEUR - 6} className="fill-ink/50" fontSize={10}>
        y: [{ymin.toFixed(1)} ; {ymax.toFixed(1)}]
      </text>
    </svg>
  );
}