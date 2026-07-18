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

// TODO MERCADO PAGO: this is a stopgap for the "Pagar ahora" CTA in Screen2 while Mercado
// Pago isn't wired up yet — it just opens WhatsApp with a payment-intent message. Once the
// integration is ready, the CTA should generate a real payment link instead of calling this.
export function buildWhatsAppPaymentUrl(systemName, lang = 'es') {
  const message =
    lang === 'es'
      ? `Hola, quiero pagar mi sistema ${systemName}, ¿me ayudas a completar el pago?`
      : `Hi, I want to pay for my ${systemName} system, can you help me complete the payment?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
