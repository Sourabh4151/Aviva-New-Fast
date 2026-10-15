module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Anek Latin"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'card-dark': 'rgba(13,11,0,0.9)',
        'primary-red': '#c7222a',
        'secondary-red': '#8B151B',
      },
      fontSize: {
        hero: ['32px', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'hero-desktop': ['42px', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'section-heading': ['18px', { lineHeight: '1', letterSpacing: '0' }],
        'section-heading-desktop': ['24px', { lineHeight: '1', letterSpacing: '0' }],
        body: ['14px', { lineHeight: '18px', letterSpacing: '0' }],
        'body-desktop': ['16px', { lineHeight: '1', letterSpacing: '0' }],
        eyebrow: ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'eyebrow-desktop': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        footnote: ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'footnote-desktop': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
      },
    },
  },
  plugins: [],
}

