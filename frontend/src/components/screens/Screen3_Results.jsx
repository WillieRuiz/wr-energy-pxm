import { useTranslation } from 'react-i18next'
import ProgressBar from '../layout/ProgressBar.jsx'
import SystemCard from '../ui/SystemCard.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { recommendSystems } from '../../utils/calculator.js'
import { saveLead } from '../../services/api.js'
import { buildWhatsAppUrl } from '../../utils/whatsapp.js'

export default function Screen3_Results() {
  const { t, i18n } = useTranslation()
  const {
    lead,
    equipmentList,
    hoursBackup,
    setHoursBackup,
    results,
    setResults,
    systemsCatalog,
  } = useCalculator()

  const validRows = equipmentList.filter((r) => r.equipo && r.cantidad > 0)

  const handleHoursChange = (val) => {
    const hours = Math.max(1, Math.min(24, Number(val)))
    setHoursBackup(hours)
    setResults(recommendSystems(validRows, systemsCatalog, hours))
  }

  if (!results) {
    return (
      <div className="p-8 text-center font-body text-gray-500">{t('screen3.loading')}</div>
    )
  }

  const { requirements, recommendations } = results
  const { ecoflow, enphase } = recommendations

  const sistemaRecomendado = [ecoflow?.sistema, enphase?.sistema].filter(Boolean).join(' | ')
  const costoTotal = (ecoflow?.usd_precio || 0) + (enphase?.usd_precio || 0)

  const handleInterested = () => {
    // Open WhatsApp first — must be synchronous in the click handler or browsers block it
    window.open(buildWhatsAppUrl(results, i18n.language), '_blank')

    // Save lead in background without blocking the redirect
    saveLead({
      nombre: lead.nombre,
      whatsapp: lead.whatsapp,
      ...(lead.email && { email: lead.email }),
      sistema_recomendado: sistemaRecomendado,
      costo_total: costoTotal,
      demanda_total_w: requirements.totalDemandW,
      potencia_necesaria_w: requirements.systemPowerW,
      capacidad_necesaria_kwh: requirements.batteryKwhRequired,
      horas_respaldo: hoursBackup,
      equipos: validRows.map((r) => ({
        equipo: r.equipo,
        cantidad: r.cantidad,
        potencia_w: r.potencia_w,
        demanda_w: r.cantidad * r.potencia_w,
      })),
    }).catch(() => {})
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <ProgressBar current={3} />

      <h2 className="font-display font-bold text-azul-tormenta text-2xl mb-4">
        {t('screen3.title')}
      </h2>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
        {/* Left — Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-hueso rounded-2xl shadow-sm p-6">
            <h3 className="font-display font-bold text-azul-tormenta text-lg mb-3">
              {t('screen3.summary_title')}
            </h3>
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-gray-500 border-b border-hueso text-left">
                  <th className="pb-2 font-medium">{t('screen2.col_equipment')}</th>
                  <th className="pb-2 font-medium text-center">{t('screen2.col_qty')}</th>
                  <th className="pb-2 font-medium text-right">{t('screen2.col_demand')}</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((row, i) => (
                  <tr key={i} className="border-b border-hueso/50">
                    <td className="py-1.5">{row.equipo}</td>
                    <td className="py-1.5 text-center">{row.cantidad}</td>
                    <td className="py-1.5 text-right font-mono">
                      {(row.cantidad * row.potencia_w).toLocaleString('en-US')} W
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-azul-tormenta text-white rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-mono text-xl font-medium">
                {Math.round(requirements.totalDemandW).toLocaleString('en-US')} W
              </div>
              <div className="text-xs text-white/60 font-body mt-1">
                {t('screen3.metric_demand')}
              </div>
            </div>
            <div className="border-x border-white/20">
              <div className="font-mono text-xl font-medium">
                {Math.round(requirements.systemPowerW).toLocaleString('en-US')} W
              </div>
              <div className="text-xs text-white/60 font-body mt-1">
                {t('screen3.metric_power')}
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-medium">
                {requirements.batteryKwhRequired.toFixed(1)} kWh
              </div>
              <div className="text-xs text-white/60 font-body mt-1">
                {t('screen3.metric_capacity')}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Recommendations */}
        <div className="space-y-4">
          <div className="bg-white border border-hueso rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <label className="font-body text-sm font-medium text-carbon whitespace-nowrap">
              {t('screen3.hours_label')}
            </label>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={hoursBackup}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="flex-1 accent-amarillo-solar"
            />
            <span className="font-mono text-carbon font-medium w-8 text-right">
              {hoursBackup}h
            </span>
          </div>

          <SystemCard system={ecoflow} brand="ecoflow" selected={!ecoflow?.needs_custom_quote} />
          <SystemCard system={enphase} brand="enphase" selected={!enphase?.needs_custom_quote} />
          <SystemCard brand="victron" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button variant="success" onClick={handleInterested} className="w-full sm:w-auto px-12 text-lg py-4">
          {t('screen3.cta_button')}
        </Button>
      </div>

      <div className="mt-6 mx-auto max-w-2xl bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
        <span className="text-blue-400 text-lg shrink-0 mt-0.5">ℹ</span>
        <p className="font-body text-sm text-blue-700 leading-relaxed">
          {t('screen3.disclaimer')}
        </p>
      </div>
    </div>
  )
}
