import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        char: "#0c0b09",
        bone: "#e8e2d4",
        ember: "#ff6b35",
        "bone-dim": "#8a8273",
        olive: "#6b7d4f",
        rust: "#a85b3c",
        slateink: "#5d6b75",
        sand: "#b3a06e",
        clay: "#8a6a5c",
      },
      fontFamily: {
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
