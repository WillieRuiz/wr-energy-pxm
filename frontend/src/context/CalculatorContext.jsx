import { createContext, useState, useEffect, useCallback } from 'react'
import { getEquipment, getSystems } from '../services/api.js'

export const CalculatorContext = createContext(null)

export function CalculatorProvider({ children }) {
  const [lead, setLead] = useState({ nombre: '', whatsapp: '', email: '' })
  const [equipmentList, setEquipmentList] = useState([
    { equipo: '', cantidad: 1, potencia_w: 0 },
  ])
  const [hoursBackup, setHoursBackup] = useState(4)
  const [results, setResults] = useState(null)
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  const [systemsCatalog, setSystemsCatalog] = useState([])
  const [currentScreen, setCurrentScreen] = useState(0)

  useEffect(() => {
    getEquipment()
      .then((data) => setEquipmentCatalog(data.equipment || []))
      .catch((err) => console.error('[CalculatorContext] GET /get-equipment failed:', err))
    getSystems()
      .then((data) => setSystemsCatalog(data.systems || []))
      .catch((err) => console.error('[CalculatorContext] GET /get-systems failed:', err))
  }, [])

  const addRow = useCallback(() => {
    setEquipmentList((prev) => [...prev, { equipo: '', cantidad: 1, potencia_w: 0 }])
  }, [])

  const updateRow = useCallback(
    (idx, field, value) => {
      setEquipmentList((prev) => {
        const next = [...prev]
        const updated = { ...next[idx], [field]: value }
        if (field === 'equipo') {
          const match = equipmentCatalog.find((e) => e.equipo === value)
          updated.potencia_w = match ? match.potencia_w : 0
        }
        next[idx] = updated
        return next
      })
    },
    [equipmentCatalog]
  )

  const removeRow = useCallback((idx) => {
    setEquipmentList((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const goToScreen = useCallback((n) => setCurrentScreen(n), [])

  return (
    <CalculatorContext.Provider
      value={{
        lead,
        setLead,
        equipmentList,
        addRow,
        updateRow,
        removeRow,
        hoursBackup,
        setHoursBackup,
        results,
        setResults,
        equipmentCatalog,
        systemsCatalog,
        currentScreen,
        goToScreen,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  )
}
