// Constants — should eventually come from the 'parametros' Google Sheet tab
const TC = 17.5
const MARGEN_CONTADO = 0.26
const MARGEN_MSI = 0.31
const IVA = 1.16
const MATERIAL_PCT = 0.20
const ENVIO_USD = 200
const ANTICIPO_PCT = 0.60
const UMBRAL_KW = 3

export function calcPricing(usdEquipo, totalDemandW) {
  const aplica = totalDemandW / 1000 >= UMBRAL_KW
  const material = aplica ? usdEquipo * MATERIAL_PCT : 0
  const costoMxn = (usdEquipo + material + ENVIO_USD) * TC
  const contado = (costoMxn / (1 - MARGEN_CONTADO)) * IVA
  const msi = (costoMxn / (1 - MARGEN_MSI)) * IVA
  return {
    contado: Math.round(contado),
    anticipo: Math.round(contado * ANTICIPO_PCT),
    saldo: Math.round(contado * (1 - ANTICIPO_PCT)),
    mensualidad: Math.round(msi / 12),
    aplica,
  }
}
