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
        bg: "#131512",
        surface: "#191B17",
        card: "#1A1C18",
        "card-hover": "#212320",
        border: "#2C2E29",
        "border-light": "#3A3C36",
        "green-forest": "#1C2C22",
        "green-sprout": "#87BD9C",
        "green-dim": "#8FAF93",
        "green-muted": "#5A6B5C",
        gold: "#D4B878",
        "gold-dark": "#B08A3C",
        "stage-empty": "#1A1C18",
        "stage-prep": "#232136",
        "stage-dark": "#242137",
        "stage-light": "#1C2C22",
        "stage-ready": "#2A2618",
        "stage-harvested": "#16181400",
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
          from: { boxShadow: "0 0 5px #87BD9C33, 0 0 10px #87BD9C22" },
          to: { boxShadow: "0 0 15px #87BD9C66, 0 0 30px #87BD9C33" },
        },
        glowGold: {
          from: { boxShadow: "0 0 5px #D4B87833, 0 0 10px #D4B87822" },
          to: { boxShadow: "0 0 20px #D4B87877, 0 0 40px #D4B87844" },
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
