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
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* ============================================================
           Gati design system — olive primary + tiranga accents.
           Calm, premium, distinctly Indian.
           ============================================================ */
        olive: {
          50: "#f6f5ee",
          100: "#ebe9d4",
          200: "#d7d4ad",
          300: "#b6b886",
          400: "#8e9466",
          500: "#6e7448",
          600: "#566034",
          700: "#444c28",
          800: "#363c1f",
          900: "#2a2f17",
          950: "#16190b",
        },
        gati: {
          50: "#f6f5ee",
          100: "#ebe9d4",
          200: "#d7d4ad",
          300: "#b6b886",
          400: "#8e9466",
          500: "#6e7448",
          600: "#566034",
          700: "#444c28",
          800: "#363c1f",
          900: "#2a2f17",
        },
        /* Ashoka Chakra — deep navy that replaces the prior sky/indigo */
        ashoka: {
          50: "#eef2f9",
          100: "#d6dcec",
          200: "#aebcd6",
          300: "#7e8fb8",
          400: "#536a98",
          500: "#354c7d",
          600: "#1d4ed8",
          700: "#1e3a8a",
          800: "#172554",
          900: "#0c1638",
          950: "#000080",
        },
        /* Saffron / Tiranga — existing, slightly refined */
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        /* India Green — slightly deeper, more dignified */
        indiaGreen: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#138808",
          900: "#0f5132",
        },
        /* Sage — for soft olive tints used as secondary surfaces */
        sage: {
          50: "#f7f8f1",
          100: "#eef0df",
          200: "#dde2c2",
          300: "#c4cba1",
          400: "#a8b283",
          500: "#8e9769",
          600: "#737d54",
          700: "#5a6341",
          800: "#444c33",
          900: "#303725",
        },
        skyline: {
          50: "#eef2f9",
          100: "#d6dcec",
          200: "#aebcd6",
          300: "#7e8fb8",
          400: "#536a98",
          500: "#354c7d",
          600: "#1d4ed8",
          700: "#1e3a8a",
          800: "#172554",
          900: "#0c1638",
        },
        slateCustom: {
          900: "#1a2014",
          800: "#28301e",
          700: "#3a462c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(47, 60, 23, 0.06)',
        'glass-hover': '0 12px 40px 0 rgba(47, 60, 23, 0.10)',
        'glass-card': '0 20px 50px rgba(26, 32, 20, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'subtle-glow': '0 0 25px -5px rgba(86, 96, 52, 0.25)',
        'olive-glow': '0 8px 24px -8px rgba(86, 96, 52, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
export default config;
