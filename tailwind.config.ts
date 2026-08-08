import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F4",
        ink: "#1C1C1A",
        board: "#1F3A34",
        "board-light": "#2C4E45",
        "board-line": "#3E635A",
        chalk: "#F4EFE1",
        "chalk-yellow": "#E8B94B",
        "chalk-blue": "#7FB0BC",
        "chalk-coral": "#D9784A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
