// Manual manifest of frontend/public/images/estaciones/ — Vite doesn't enumerate public/
// assets at build time, so this mirrors the actual files on disk (double ".png.png"
// extension, exactly as they exist there). River 3 Max/Plus and Delta 3 1000W/1500W
// currently share a single placeholder photo each — that's expected, not a bug.
const INSTALLED_IMAGES = {
  'EFDeltaProUltra-US': {
    basica: [
      '/images/estaciones/EFDeltaProUltra-US_instalado.png.png',
      '/images/estaciones/EFDeltaProUltra-US_instalado_2.png.png',
      '/images/estaciones/EFDeltaProUltra-US_instalado_3.png.png',
    ],
    avanzada: ['/images/estaciones/EFDeltaProUltra-US_avanzado_instalado.png.png'],
  },
  'EFDELTAPRO3-US': [
    '/images/estaciones/EFDELTAPRO3-US_instalado.png.png',
    '/images/estaciones/EFDELTAPRO3-US_instalado_2.png.png',
    '/images/estaciones/EFDELTAPRO3-US_instalado_3.png.png',
  ],
  'DELTAPro-1600W-US': [
    '/images/estaciones/DELTAPro-1600W-US_instalado.png.png',
    '/images/estaciones/DELTAPro-1600W-US_instalado_2.png.png',
    '/images/estaciones/DELTAPro-1600W-US_instalado_3.png.png',
  ],
  'EFDELTA2Max-US': ['/images/estaciones/EFDELTA2Max-US_instalado.png.png'],
  'EFDELTA1500-US': ['/images/estaciones/EFDELTA1500-US_instalado.png.png'],
  'EFDELTA3-LA-CBox': ['/images/estaciones/EFDELTA3-LA-CBox_instalado.png.png'],
  'EFRIVER3Max-US': ['/images/estaciones/EFRIVER3Max-US_instalado.png.png'],
  'EFRIVER3Plus-US-SP-CBox': ['/images/estaciones/EFRIVER3Plus-US-SP-CBox_instalado.png.png'],
}

// TODO: no real product-only photos exist yet for any station — this stays empty until
// they're uploaded as public/images/estaciones/{codigo}_producto.png.
const PRODUCT_IMAGES = {}

export function getInstalledImages(codigoEstacion, nBaterias = 0) {
  const entry = INSTALLED_IMAGES[codigoEstacion]
  if (!entry) return []
  if (codigoEstacion === 'EFDeltaProUltra-US') {
    return nBaterias >= 2 ? entry.avanzada : entry.basica
  }
  return entry
}

export function getProductImage(codigoEstacion) {
  return PRODUCT_IMAGES[codigoEstacion] || null
}
