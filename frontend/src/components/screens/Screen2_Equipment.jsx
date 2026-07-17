import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'
import { trackPixelViewContent } from '../../utils/pixelEvents.js'
import ProgressBar from '../layout/ProgressBar.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { recommend } from '../../services/api.js'
import { calcPricing } from '../../utils/pricing.js'

function fmt(n) {
  return Math.round(n).toLocaleString('es-MX')
}

function PricingBlock({ system, totalDemandW, t }) {
  if (!system) return null
  if (system.needs_custom_quote) {
    return (
      <p className="font-body text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        {t('screen2.custom_quote')}
      </p>
    )
  }
  const { contado, anticipo, saldo, mensualidad } = calcPricing(system.usd_precio, totalDemandW)
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-body text-sm text-gray-500">{t('screen2.contado_label')}</span>
        <span className="font-mono font-medium text-lg text-carbon">${fmt(contado)} MXN</span>
      </div>
      <div className="pl-3 border-l-2 border-gray-100 space-y-1 text-sm font-body text-gray-500">
        <div className="flex justify-between">
          <span>{t('screen2.anticipo_label')}</span>
          <span className="font-mono">${fmt(anticipo)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('screen2.saldo_label')}</span>
          <span className="font-mono">${fmt(saldo)}</span>
        </div>
      </div>
      <div className="flex items-baseline justify-between pt-1 border-t border-gray-100">
        <span className="font-body text-sm text-gray-500">{t('screen2.msi_label')}</span>
        <span className="font-mono font-medium text-carbon">
          ${fmt(mensualidad)}<span className="text-xs text-gray-400">/mes</span>
        </span>
      </div>
    </div>
  )
}

function SystemBlock({ system, brand, totalDemandW, t }) {
  if (brand === 'victron') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-display font-bold text-azul-tormenta text-lg mb-1">Victron + Pytes</h3>
        <p className="font-body text-sm text-gray-400">{t('screen2.victron_placeholder')}</p>
      </div>
    )
  }
  if (!system) return null
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-2 ${!system.needs_custom_quote ? 'border-amarillo-solar' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display font-bold text-azul-tormenta text-lg leading-tight">
          {system.sistema}
        </h3>
        {!system.needs_custom_quote && (
          <span className="ml-2 shrink-0 bg-amarillo-solar text-carbon text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {t('screen2.recommended')}
          </span>
        )}
      </div>
      <div className="flex gap-3 text-xs font-mono text-gray-400 mb-4">
        <span>{system.almacenamiento} kWh</span>
        <span>{system.potencia} kW</span>
        {system.acepta_smart_panel && (
          <span className="text-azul-tormenta">+ Smart Panel disponible</span>
        )}
      </div>
      <PricingBlock system={system} totalDemandW={totalDemandW} t={t} />
    </div>
  )
}

export default function Screen2_Recommendation() {
  const { t } = useTranslation()
  const {
    results,
    setResults,
    hoursBackup,
    setHoursBackup,
    equipmentCatalog,
    selections,
    toggleItem,
    setItemQty,
    getSelectedRows,
    goToScreen,
  } = useCalculator()

  useEffect(() => {
    trackEvent('screen_view', { pantalla: 'sistema_propuesto' })
    trackPixelViewContent('sistema_propuesto')
  }, [])

  // Debounced recalculate — skips first render (results already set by Screen1)
  const isFirst = useRef(true)
  const timer = useRef(null)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const rows = getSelectedRows()
      if (rows.length === 0) return
      try {
        const data = await recommend({
          equipos: rows,
          horas_respaldo: hoursBackup,
        })
        setResults(data)
      } catch {}
    }, 350)
    return () => clearTimeout(timer.current)
  }, [selections, hoursBackup]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!results) {
    return (
      <div className="p-8 text-center font-body text-gray-400">{t('screen2.loading')}</div>
    )
  }

  const { requirements, recommendations } = results
  const { ecoflow } = recommendations

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <ProgressBar current={2} />

      <h2 className="font-display font-bold text-azul-tormenta text-2xl mb-1">
        {t('screen2.title')}
      </h2>

      {/* Requirements summary */}
      <div className="bg-azul-tormenta text-white rounded-2xl p-4 grid grid-cols-3 gap-2 text-center mb-4">
        <div>
          <div className="font-mono text-lg font-medium">
            {Math.round(requirements.totalDemandW).toLocaleString('en-US')} W
          </div>
          <div className="text-xs text-white/60 font-body mt-0.5">{t('screen2.metric_demand')}</div>
        </div>
        <div className="border-x border-white/20">
          <div className="font-mono text-lg font-medium">
            {Math.round(requirements.systemPowerW).toLocaleString('en-US')} W
          </div>
          <div className="text-xs text-white/60 font-body mt-0.5">{t('screen2.metric_power')}</div>
        </div>
        <div>
          <div className="font-mono text-lg font-medium">
            {requirements.batteryKwhRequired.toFixed(1)} kWh
          </div>
          <div className="text-xs text-white/60 font-body mt-0.5">{t('screen2.metric_capacity')}</div>
        </div>
      </div>

      {/* Backup hours slider */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4 mb-4">
        <label className="font-body text-sm font-medium text-carbon whitespace-nowrap">
          {t('screen2.hours_label')}
        </label>
        <input
          type="range" min="2" max="24" step="1"
          value={hoursBackup}
          onChange={(e) => setHoursBackup(Number(e.target.value))}
          className="flex-1 accent-amarillo-solar"
        />
        <span className="font-mono text-carbon font-medium w-8 text-right">{hoursBackup}h</span>
      </div>

      {/* System recommendation */}
      <div className="space-y-3 mb-4">
        <SystemBlock system={ecoflow} brand="ecoflow" totalDemandW={requirements.totalDemandW} t={t} />
        <SystemBlock brand="victron" t={t} />
      </div>

      <p className="text-xs font-body text-gray-400 mb-4">{t('screen2.disclaimer')}</p>

      {/* Sticky "Continuar" */}
      <div className="sticky top-14 z-10 -mx-4 px-4 py-3 bg-white border-y border-gray-100 shadow-sm mb-6">
        <Button onClick={() => goToScreen(3)} className="w-full text-base py-3">
          {t('screen2.continue_button')} →
        </Button>
      </div>

      {/* Editable equipment list */}
      <div className="mb-8">
        <h3 className="font-display font-bold text-azul-tormenta text-lg mb-1">
          {t('screen2.edit_title')}
        </h3>
        <p className="font-body text-sm text-gray-500 mb-3">{t('screen2.edit_subtitle')}</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {equipmentCatalog.map((item) => {
            const isChecked = item.equipo in selections
            const qty = selections[item.equipo] ?? 1
            return (
              <div key={item.equipo} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.equipo)}
                  className="w-5 h-5 accent-naranja-wr shrink-0 cursor-pointer"
                />
                <span className="flex-1 font-body text-carbon text-sm select-none">
                  {item.equipo}
                </span>
                <span className="font-mono text-xs text-gray-400 shrink-0">
                  {item.potencia_w.toLocaleString('en-US')} W
                </span>
                {isChecked && (
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      onClick={() => setItemQty(item.equipo, qty - 1)}
                      disabled={qty <= 1}
                      className="w-7 h-7 rounded-full border border-gray-300 font-mono text-base flex items-center justify-center disabled:opacity-30 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="font-mono w-5 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => setItemQty(item.equipo, qty + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 font-mono text-base flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
