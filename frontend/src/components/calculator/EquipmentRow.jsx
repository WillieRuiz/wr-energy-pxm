import { useTranslation } from 'react-i18next'
import Dropdown from '../ui/Dropdown.jsx'

export default function EquipmentRow({ row, idx, catalog, onUpdate, onRemove }) {
  const { t } = useTranslation()
  const demanda = row.cantidad * row.potencia_w

  return (
    <tr className="border-b border-hueso">
      <td className="py-2 pr-2">
        <Dropdown
          options={catalog.map((e) => ({ value: e.equipo, label: e.equipo }))}
          value={row.equipo}
          onChange={(val) => onUpdate(idx, 'equipo', val)}
          placeholder={t('screen2.select_equipment')}
        />
      </td>
      <td className="py-2 pr-2 w-20">
        <input
          type="number"
          min="1"
          value={row.cantidad}
          onChange={(e) =>
            onUpdate(idx, 'cantidad', Math.max(1, parseInt(e.target.value) || 1))
          }
          className="border border-hueso rounded-lg px-3 py-2 font-body focus:border-azul-tormenta focus:outline-none w-full text-center"
        />
      </td>
      <td className="py-2 pr-2 font-mono text-carbon text-right whitespace-nowrap">
        {demanda > 0 ? `${demanda.toLocaleString('en-US')} W` : '—'}
      </td>
      <td className="py-2 text-center">
        <button
          onClick={() => onRemove(idx)}
          className="text-red-400 hover:text-red-600 transition-colors text-xl leading-none font-bold"
          aria-label="Remove row"
        >
          ×
        </button>
      </td>
    </tr>
  )
}
