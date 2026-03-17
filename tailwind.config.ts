import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#0f172a",
        "sidebar-hover": "#1e293b",
        "sidebar-active": "#1e293b",
        "sidebar-border": "#1e293b",
        "sidebar-text": "#94a3b8",
        "sidebar-text-active": "#f1f5f9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
        "card-hover":
          "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
