import GraphingTool from "@/components/GraphingTool";

export const metadata = {
  title: "Traceur interactif — Maths",
  description: "Tracez des fonctions et étudiez des suites récurrentes de manière interactive.",
};

export default function TraceurPage() {
  return (
    <div className="paper-grid min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-board-light">Outil interactif</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Traceur de fonctions & de suites</h1>
        <p className="mt-3 text-ink/60">
          Entrez une expression pour tracer une fonction, ou étudiez la convergence d'une suite définie par
          récurrence <code className="font-mono">u(n+1) = f(u(n))</code> grâce au diagramme en toile
          d'araignée (très utile pour le chapitre sur la continuité et le théorème du point fixe).
        </p>

        <div className="mt-8">
          <GraphingTool />
        </div>
      </div>
    </div>
  );
}
