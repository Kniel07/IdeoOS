import type { Config } from "tailwindcss";

// Design tokens — dark, high-density, developer-tool aesthetic.
// Base: near-black slate (not pure #000) with a violet-cyan signal accent,
// a warm amber reserved only for "needs attention" states (questions, warnings).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0a0b0f",
        surface: "#111319",
        raised: "#171a22",
        border: "#232733",
        borderStrong: "#2e3341",
        ink: "#e7e9ee",
        muted: "#8a8f9c",
        faint: "#5b606d",
        accent: "#7c6fff",
        accentDim: "#443d99",
        signal: "#38d4c4",
        warn: "#e8a23d",
        danger: "#ea5c5c",
        ok: "#5ecb85",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        elevate: "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 16px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
