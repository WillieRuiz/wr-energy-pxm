import { useTranslation } from 'react-i18next'
import ProgressBar from '../layout/ProgressBar.jsx'
import EquipmentTable from '../calculator/EquipmentTable.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { recommendSystems } from '../../utils/calculator.js'

export default function Screen1_Equipment() {
  const { t } = useTranslation()
  const {
    equipmentList,
    addRow,
    updateRow,
    removeRow,
    equipmentCatalog,
    systemsCatalog,
    hoursBackup,
    setHoursBackup,
    setResults,
    goToScreen,
  } = useCalculator()

  const validRows = equipmentList.filter((r) => r.equipo && r.cantidad > 0)
  const totalW = validRows.reduce((sum, r) => sum + r.cantidad * r.potencia_w, 0)
  const canCalculate = validRows.length > 0

  const handleCalculate = () => {
    const results = recommendSystems(validRows, systemsCatalog, hoursBackup)
    setResults(results)
    goToScreen(2)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
      <ProgressBar current={1} total={2} />

      <h2 className="font-display font-bold text-azul-tormenta text-2xl mb-1">
        {t('screen1.title')}
      </h2>
      <p className="font-body text-gray-500 text-sm mb-4">{t('screen1.subtitle')}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-hueso p-4 mb-4">
        <EquipmentTable
          rows={equipmentList}
          catalog={equipmentCatalog}
          onUpdate={updateRow}
          onRemove={removeRow}
        />
        <button
          onClick={addRow}
          className="mt-4 text-azul-tormenta font-body text-sm font-semibold hover:underline"
        >
          + {t('screen1.add_row')}
        </button>
      </div>

      <div className="bg-white border border-hueso rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-4">
        <label className="font-body text-sm font-medium text-carbon whitespace-nowrap">
          {t('screen1.hours_label')}
        </label>
        <input
          type="range"
          min="2"
          max="24"
          step="1"
          value={hoursBackup}
          onChange={(e) => setHoursBackup(Number(e.target.value))}
          className="flex-1 accent-amarillo-solar"
        />
        <span className="font-mono text-carbon font-medium w-8 text-right">{hoursBackup}h</span>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="font-mono text-carbon font-medium text-lg">
          {totalW > 0 ? `${totalW.toLocaleString('en-US')} W` : '—'}
        </div>
        <Button onClick={handleCalculate} disabled={!canCalculate} className="flex-1 sm:flex-none">
          {t('screen1.calculate_button')} →
        </Button>
      </div>
    </div>
  )
}
