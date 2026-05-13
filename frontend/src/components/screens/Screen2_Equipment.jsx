import { useTranslation } from 'react-i18next'
import ProgressBar from '../layout/ProgressBar.jsx'
import EquipmentTable from '../calculator/EquipmentTable.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { recommendSystems } from '../../utils/calculator.js'

export default function Screen2_Equipment() {
  const { t } = useTranslation()
  const {
    equipmentList,
    addRow,
    updateRow,
    removeRow,
    equipmentCatalog,
    systemsCatalog,
    setResults,
    goToScreen,
  } = useCalculator()

  const validRows = equipmentList.filter((r) => r.equipo && r.cantidad > 0)
  const totalW = validRows.reduce((sum, r) => sum + r.cantidad * r.potencia_w, 0)
  const canCalculate = validRows.length > 0

  const handleCalculate = () => {
    const results = recommendSystems(validRows, systemsCatalog)
    setResults(results)
    goToScreen(3)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      <ProgressBar current={2} />

      <h2 className="font-display font-bold text-azul-tormenta text-2xl mb-4">
        {t('screen2.title')}
      </h2>

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
          + {t('screen2.add_row')}
        </button>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="font-mono text-carbon font-medium text-lg">
          {totalW > 0 ? `${totalW.toLocaleString('en-US')} W` : '—'}
        </div>
        <Button onClick={handleCalculate} disabled={!canCalculate} className="flex-1 sm:flex-none">
          {t('screen2.calculate_button')} →
        </Button>
      </div>
    </div>
  )
}
