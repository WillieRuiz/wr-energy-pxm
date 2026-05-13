import { useTranslation } from 'react-i18next'
import EquipmentRow from './EquipmentRow.jsx'

export default function EquipmentTable({ rows, catalog, onUpdate, onRemove }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="text-left text-gray-500 border-b border-hueso">
            <th className="pb-2 font-medium">{t('screen2.col_equipment')}</th>
            <th className="pb-2 font-medium w-20 text-center">{t('screen2.col_qty')}</th>
            <th className="pb-2 font-medium text-right">{t('screen2.col_demand')}</th>
            <th className="pb-2 w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <EquipmentRow
              key={idx}
              row={row}
              idx={idx}
              catalog={catalog}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
