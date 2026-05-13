import { useTranslation } from 'react-i18next'

export default function SystemCard({ system, brand, selected }) {
  const { t } = useTranslation()

  if (brand === 'victron') {
    return (
      <div className="bg-white border border-hueso rounded-2xl shadow-sm p-6">
        <h3 className="font-display font-bold text-azul-tormenta text-xl mb-2">
          Victron + Pytes
        </h3>
        <p className="font-body text-gray-500 text-sm">{t('screen3.victron_placeholder')}</p>
      </div>
    )
  }

  if (!system) return null

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-6 border-2 transition-all ${
        selected ? 'border-amarillo-solar' : 'border-hueso'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display font-bold text-azul-tormenta text-xl leading-tight">
          {system.sistema}
        </h3>
        {selected && (
          <span className="ml-2 shrink-0 bg-amarillo-solar text-carbon text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {t('screen3.recommended')}
          </span>
        )}
      </div>

      {/* Prices */}
      <div className="mb-3 space-y-0.5">
        <div className="font-mono text-xl text-carbon font-medium">
          ${system.usd_precio?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </div>
        <div className="font-mono text-sm text-gray-400">
          ${system.mxn_precio?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
        </div>
      </div>

      {/* Specs */}
      <div className="flex gap-4 text-sm font-mono text-gray-500 mb-2">
        <span>{system.almacenamiento} kWh</span>
        <span>{system.potencia} kW</span>
        <span>{system.phases}Ø</span>
        <span className="text-gray-400">${system.usd_wh}/Wh</span>
      </div>

      {system.needs_custom_quote && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-body">
          {t('screen3.custom_quote_notice')}
        </div>
      )}
    </div>
  )
}
