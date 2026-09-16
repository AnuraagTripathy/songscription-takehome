import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Palette values live here as literals, not as var() indirection: Tailwind
// cannot inject an alpha channel into a full-colour custom property, so
// `bg-graphite/70` silently does nothing when the token is a var. The same
// values are mirrored as CSS variables in globals.css for SVG and CSS use.
const board = "#39432f";
const boardDeep = "#2b3324";
const boardSoft = "#4b573c";
const rule = "#ccd5ae";
const sheet = "#e9edc9";
const paper = "#fefae0";
const paperWarm = "#faedcd";
const kraft = "#d4a373";
const kraftDeep = "#b4623a";
const graphite = "#2a3123";
const graphiteSoft = "#4a5540";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Names avoid Tailwind utility prefixes on purpose: a token called
        // `base` once collided with the built-in `text-base` font size.
        board: { DEFAULT: board, deep: boardDeep, soft: boardSoft },
        rule: rule,
        sheet: sheet,
        paper: { DEFAULT: paper, warm: paperWarm },
        kraft: { DEFAULT: kraft, deep: kraftDeep },
        graphite: { DEFAULT: graphite, soft: graphiteSoft },

        // The semantic names the pulled-in components speak.
        background: paper,
        foreground: graphite,
        border: rule,
        input: rule,
        ring: kraftDeep,
        primary: { DEFAULT: kraft, foreground: graphite },
        secondary: { DEFAULT: paper, foreground: graphite },
        muted: { DEFAULT: sheet, foreground: graphiteSoft },
        accent: { DEFAULT: paperWarm, foreground: graphite },
        destructive: { DEFAULT: kraftDeep, foreground: paper },
        popover: { DEFAULT: paper, foreground: graphite },
        card: { DEFAULT: paper, foreground: graphite },
      },
      fontFamily: {
        book: ["var(--font-book)", "Georgia", "serif"],
        label: ["var(--font-label)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "var(--lift-1)",
        "lift-2": "var(--lift-2)",
      },
      keyframes: {
        "sheet-in": {
          from: {
            opacity: "0",
            transform: "translate(-50%, -43%) scale(0.955)",
            filter: "blur(7px)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)", filter: "blur(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "sheet-in": "sheet-in 340ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
