import { createContext, useState, useEffect, useCallback } from 'react'
import { getEquipment } from '../services/api.js'

export const CalculatorContext = createContext(null)

export function CalculatorProvider({ children }) {
  const [selections, setSelections] = useState({}) // { [equipo]: cantidad }
  const [hoursBackup, setHoursBackup] = useState(4)
  const [results, setResults] = useState(null)
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  const [currentScreen, setCurrentScreen] = useState(0)
  const [lead, setLead] = useState({ nombre: '', whatsapp: '', email: '' })
  // Assigned once at session start; stays fixed for the lifetime of the provider
  const [abTestGroup] = useState(() => (Math.random() < 0.5 ? 'pdf' : 'call'))

  useEffect(() => {
    getEquipment()
      .then((data) => setEquipmentCatalog(data.equipment || []))
      .catch((err) => console.error('[CalculatorContext] GET /get-equipment failed:', err))
  }, [])

  const toggleItem = useCallback((equipo) => {
    setSelections((prev) => {
      if (equipo in prev) {
        const { [equipo]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [equipo]: 1 }
    })
  }, [])

  const setItemQty = useCallback((equipo, qty) => {
    if (qty < 1) return
    setSelections((prev) => ({ ...prev, [equipo]: qty }))
  }, [])

  const goToScreen = useCallback((n) => setCurrentScreen(n), [])

  const getSelectedRows = useCallback(() => {
    return equipmentCatalog
      .filter((item) => item.equipo in selections)
      .map((item) => ({
        equipo: item.equipo,
        cantidad: selections[item.equipo],
        potencia_w: item.potencia_w,
        demanda_w: item.potencia_w * selections[item.equipo],
      }))
  }, [equipmentCatalog, selections])

  return (
    <CalculatorContext.Provider
      value={{
        selections,
        toggleItem,
        setItemQty,
        getSelectedRows,
        hoursBackup,
        setHoursBackup,
        results,
        setResults,
        equipmentCatalog,
        currentScreen,
        goToScreen,
        lead,
        setLead,
        abTestGroup,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  )
}
