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
    },
  },
  plugins: [],
};
