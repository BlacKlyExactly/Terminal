/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#030d22",
        response: "#ff2e87",
        path: "#ffd44e",
        user: "#06215a",
        header: "#141138",
        light: "#0ef3ff",
        "header-border": "#d64196",
      },
    },
  },
  plugins: [],
};
