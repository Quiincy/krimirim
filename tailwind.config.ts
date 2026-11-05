import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crimea: {
          gold: "#C89B3C",
          amber: "#D97724",
          terracotta: "#B84A39",
          deep: "#1B1613",
          teal: "#1997A9",
        },
        rome: {
          marble: "#F8F6F1",
          stone: "#EAE5DC",
          ribbon: "#E2E4E6",
          charcoal: "#18181B",
          olive: "#4A5D4E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

