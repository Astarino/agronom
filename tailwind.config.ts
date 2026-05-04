import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070F09",
        surface: "#0D1A0F",
        card: "#101A12",
        "card-hover": "#141F16",
        border: "#1C3020",
        "border-light": "#243C28",
        "green-forest": "#0D2818",
        "green-sprout": "#4ADE80",
        "green-dim": "#8FAF93",
        "green-muted": "#4A6B4E",
        gold: "#FCD34D",
        "gold-dark": "#D97706",
        "stage-empty": "#0F1A11",
        "stage-prep": "#1A1535",
        "stage-dark": "#1C1530",
        "stage-light": "#0F2B14",
        "stage-ready": "#2B2500",
        "stage-harvested": "#0A1409",
      },
      fontFamily: {
        fraunces: ["Fraunces", "Georgia", "serif"],
        jakarta: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-green": "glowGreen 2s ease-in-out infinite alternate",
        "glow-gold": "glowGold 1.5s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "sprout": "sprout 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        glowGreen: {
          from: { boxShadow: "0 0 5px #4ADE8033, 0 0 10px #4ADE8022" },
          to: { boxShadow: "0 0 15px #4ADE8066, 0 0 30px #4ADE8033" },
        },
        glowGold: {
          from: { boxShadow: "0 0 5px #FCD34D33, 0 0 10px #FCD34D22" },
          to: { boxShadow: "0 0 20px #FCD34D77, 0 0 40px #FCD34D44" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        sprout: {
          from: { transform: "scale(0.8)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
