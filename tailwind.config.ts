import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F4",
        ink: "#1C1C1A",
        chalk: "#F4EFE1",
        "chalk-yellow": "#E8B94B",
        "chalk-blue": "#7FB0BC",
        "chalk-coral": "#D9784A",
        "bebe-pink": "#FFD1E3",
        "bebe-pink-dark": "#FF8FB8",
        "sky-bleu": "#BEE7FF",
        "sky-bleu-dark": "#5EC1F2",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
        "pink-sky-radial":
          "radial-gradient(circle at 15% 20%, #FFD1E3 0%, transparent 45%), radial-gradient(circle at 85% 25%, #BEE7FF 0%, transparent 45%), radial-gradient(circle at 50% 95%, #FFE8F2 0%, transparent 50%)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        blob: "blob 9s infinite ease-in-out",
        floaty: "floaty 4s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        "pop-in": "pop-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;