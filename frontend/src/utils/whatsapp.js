const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''

export function buildWhatsAppUrl(results, lang = 'es') {
  const { requirements } = results || {}
  const demandKw = requirements ? (requirements.totalDemandW / 1000).toFixed(1) : '?'
  const capacityKwh = requirements ? requirements.batteryKwhRequired.toFixed(1) : '?'

  const message =
    lang === 'es'
      ? `Hola, acabo de usar la calculadora de WR Energy.\n\n` +
        `Mi instalación necesita:\n` +
        `• Demanda: ${demandKw} kW\n` +
        `• Banco de baterías: ${capacityKwh} kWh\n\n` +
        `¿Me pueden dar más información y una cotización?`
      : `Hi, I just used the WR Energy calculator.\n\n` +
        `My installation needs:\n` +
        `• Demand: ${demandKw} kW\n` +
        `• Battery bank: ${capacityKwh} kWh\n\n` +
        `Can you give me more information and a quote?`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
