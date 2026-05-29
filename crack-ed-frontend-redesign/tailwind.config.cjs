module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'card-dark': 'rgba(13,11,0,0.9)'
      }
    },
  },
  plugins: [],
}

