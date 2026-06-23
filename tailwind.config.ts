import type { Config } from "tailwindcss";

// Design tokens from design_handoff_dibs/README.md. Kept in sync with the CSS
// variables defined in app/globals.css — those are the source of truth at
// runtime; these aliases let us use them in Tailwind utility classes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-imessage": "var(--bg-imessage)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "bubble-in": "var(--bubble-in)",
        text: "var(--text)",
        "text-60": "var(--text-60)",
        "text-50": "var(--text-50)",
        "text-40": "var(--text-40)",
        hairline: "var(--hairline)",
        "hairline-strong": "var(--hairline-strong)",
        lime: "var(--lime)",
        "lime-deep": "var(--lime-deep)",
        pink: "var(--pink)",
        periwinkle: "var(--periwinkle)",
        peach: "var(--peach)",
        mint: "var(--mint)",
      },
      fontFamily: {
        display: ["var(--font-gabarito)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "lime-cta": "0 10px 32px rgba(200,255,77,0.42)",
        "lime-soft": "0 6px 22px rgba(200,255,77,0.38)",
        pink: "0 4px 16px rgba(255,93,162,0.45)",
        seal: "0 0 42px rgba(200,255,77,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
