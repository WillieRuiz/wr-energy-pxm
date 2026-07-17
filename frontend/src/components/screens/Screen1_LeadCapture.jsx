import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'
import ProgressBar from '../layout/ProgressBar.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { recommend } from '../../services/api.js'

export default function Screen1_Equipment() {
  const { t } = useTranslation()
  const {
    equipmentCatalog,
    selections,
    toggleItem,
    setItemQty,
    hoursBackup,
    setResults,
    goToScreen,
  } = useCalculator()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const selectedCount = Object.keys(selections).length

  useEffect(() => {
    trackEvent('screen_view', { pantalla: 'seleccion_equipos' })
  }, [])

  const handleAdd = async () => {
    const equipos = equipmentCatalog
      .filter((item) => item.equipo in selections)
      .map((item) => ({
        equipo: item.equipo,
        cantidad: selections[item.equipo],
        potencia_w: item.potencia_w,
      }))

    setLoading(true)
    setError(null)
    try {
      const data = await recommend({ equipos, horas_respaldo: hoursBackup })
      setResults(data)
      goToScreen(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (equipmentCatalog.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center font-body text-gray-400">
        {t('screen1.loading')}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-28">
      <ProgressBar current={1} />

      <h2 className="font-display font-bold text-azul-tormenta text-2xl mb-1">
        {t('screen1.title')}
      </h2>
      <p className="font-body text-gray-500 text-sm mb-4">{t('screen1.subtitle')}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {equipmentCatalog.map((item) => {
          const isChecked = item.equipo in selections
          const qty = selections[item.equipo] ?? 1

          return (
            <div key={item.equipo} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                id={`chk-${item.equipo}`}
                checked={isChecked}
                onChange={() => toggleItem(item.equipo)}
                className="w-5 h-5 accent-naranja-wr shrink-0 cursor-pointer"
              />
              <label
                htmlFor={`chk-${item.equipo}`}
                className="flex-1 font-body text-carbon text-sm cursor-pointer select-none"
              >
                {item.equipo}
              </label>
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

      {error && (
        <p className="mt-3 text-sm text-red-600 font-body text-center">{error}</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <span className="font-body text-sm text-carbon">
          {selectedCount > 0
            ? `${selectedCount} equipo${selectedCount !== 1 ? 's' : ''} seleccionado${selectedCount !== 1 ? 's' : ''}`
            : t('screen1.none_selected')}
        </span>
        <Button onClick={handleAdd} disabled={selectedCount === 0 || loading} className="shrink-0">
          {loading ? '...' : `${t('screen1.add_button')} →`}
        </Button>
      </div>
    </div>
  )
}
