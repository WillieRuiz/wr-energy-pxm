export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'azul-tormenta': '#1B2A4A',
        'amarillo-solar': '#F4C430',
        'carbon': '#1A1A1A',
        'hueso': '#F2F2F2',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'h1-mobile': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1-desktop': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
