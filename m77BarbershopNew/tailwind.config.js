/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        custom_1 : ["PT Serif",'serif'],
        custom_2 : ["Libre Baskerville","serif"],
        custom_3 : ["Expletus Sans","sans-serif"]
      }
    },
  },
  plugins: [],
}