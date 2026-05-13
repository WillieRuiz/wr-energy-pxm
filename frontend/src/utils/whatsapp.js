const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''

export function buildWhatsAppUrl(results, lang = 'es') {
  const { requirements, recommendations } = results
  const { ecoflow, enphase } = recommendations

  const fmtW = (w) => `${Math.round(w).toLocaleString('en-US')} W`
  const fmtKwh = (kwh) => `${kwh.toFixed(1)} kWh`
  const fmtPrice = (s) =>
    s ? `${s.sistema} · $${s.usd_precio?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` : 'N/A'

  const message =
    lang === 'es'
      ? `Hola, acabo de usar la calculadora y obtuve estos resultados:\n` +
        `- Demanda: ${fmtW(requirements.totalDemandW)}\n` +
        `- Capacidad necesaria: ${fmtKwh(requirements.batteryKwhRequired)}\n` +
        `- Sistema Ecoflow recomendado: ${fmtPrice(ecoflow)}\n` +
        `- Sistema Enphase recomendado: ${fmtPrice(enphase)}\n` +
        `Estoy interesado.`
      : `Hi, I just used the calculator and got these results:\n` +
        `- Demand: ${fmtW(requirements.totalDemandW)}\n` +
        `- Required capacity: ${fmtKwh(requirements.batteryKwhRequired)}\n` +
        `- Recommended Ecoflow system: ${fmtPrice(ecoflow)}\n` +
        `- Recommended Enphase system: ${fmtPrice(enphase)}\n` +
        `I'm interested.`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
