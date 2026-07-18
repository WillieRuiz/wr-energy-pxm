import { calcPricing } from './pricing.js'

// Shared by Screen2 (Pagar ahora / Contactar a Willie) and Screen3 (WhatsApp / Calendly)
// so every conversion point sends POST /save-lead the exact same shape.
export function buildLeadPayload({ lead, results, getSelectedRows, hoursBackup, abTestGroup, language }) {
  const { requirements, recommendations } = results || {}
  const { ecoflow, enphase } = recommendations || {}
  const sistemaRecomendado = [ecoflow?.sistema, enphase?.sistema].filter(Boolean).join(' | ')
  const costoTotal = (ecoflow?.usd_precio || 0) + (enphase?.usd_precio || 0)
  const totalDemandW = requirements?.totalDemandW || 0
  const pricing = calcPricing(costoTotal, totalDemandW)
  return {
    nombre: lead.nombre,
    whatsapp: lead.whatsapp,
    sistema_recomendado: sistemaRecomendado,
    costo_total: costoTotal,
    precio_contado_mxn: pricing.contado,
    precio_msi_mxn: pricing.mensualidad,
    demanda_total_w: totalDemandW,
    potencia_necesaria_w: requirements?.systemPowerW || 0,
    capacidad_necesaria_kwh: requirements?.batteryKwhRequired || 0,
    horas_respaldo: hoursBackup,
    equipos: getSelectedRows().map((r) => ({
      equipo: r.equipo,
      cantidad: r.cantidad,
      potencia_w: r.potencia_w,
      demanda_w: r.demanda_w,
    })),
    ab_test_group: abTestGroup,
    language,
  }
}
