/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.html",
    "./*.js",
    "./**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: '#13131a',
        accent: '#a855f7',
        secondary: '#ec4899',
      }
    },
  },
  plugins: [],
}