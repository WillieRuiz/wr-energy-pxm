export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Colores de marca
        'azul-wr':    '#1f2f58',
        'naranja-wr': '#f47c02',
        'blanco':     '#ffffff',
        // Aliases de compatibilidad para las pantallas de la calculadora (no renombrar)
        'azul-tormenta':  '#1f2f58',
        'amarillo-solar': '#f47c02',
        'carbon':         '#1A1A1A',
        'hueso':          '#ffffff',
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
