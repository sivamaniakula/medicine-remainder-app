/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Calming teal accent per the project's design direction -
        // used consistently for primary actions/active states.
        accent: {
          50: "#eefaf7",
          100: "#d3f1ea",
          400: "#2fa792",
          500: "#1f8a77",
          600: "#186f60",
        },
        // Deep teal-charcoal used for the sidebar and login panel, so the
        // product reads as a considered brand rather than white-on-white.
        ink: {
          900: "#132824",
          800: "#1a332e",
          700: "#22403a",
          600: "#375650",
        },
        status: {
          taken: "#1f8a77",
          upcoming: "#c98a1c",
          missed: "#c0432f",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(19, 40, 36, 0.04), 0 8px 24px -12px rgba(19, 40, 36, 0.12)",
      },
    },
  },
  plugins: [],
};
