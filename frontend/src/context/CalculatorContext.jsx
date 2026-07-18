import { createContext, useState, useEffect, useCallback } from 'react'
import { getEquipment } from '../services/api.js'
import { trackEvent } from '../utils/analytics.js'

export const CalculatorContext = createContext(null)

// Query param ?entrada=directa skips the landing screen (e.g. Meta Ads deep link)
function getEntryPointFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('entrada') === 'directa' ? 'directa' : 'landing'
}

// Meta Ads dynamic param utm_content={{placement}} → "facebook_reels", "instagram_feed", etc.
function getAdPlacementFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_content') || 'sin_dato'
}

// Mercado Pago's back_urls all point to ?pago=gracias — landing here means the
// checkout flow finished (approved/pending/failure all land on the same thank-you screen).
function hasPagoGraciasParam() {
  const params = new URLSearchParams(window.location.search)
  return params.get('pago') === 'gracias'
}

export function CalculatorProvider({ children }) {
  const [selections, setSelections] = useState({}) // { [equipo]: cantidad }
  const [hoursBackup, setHoursBackup] = useState(4)
  const [results, setResults] = useState(null)
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  // Assigned once at session start; stays fixed for the lifetime of the provider
  const [entryPoint] = useState(() => getEntryPointFromURL())
  const [adPlacement] = useState(() => getAdPlacementFromURL())
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (hasPagoGraciasParam()) return 4
    return getEntryPointFromURL() === 'directa' ? 1 : 0
  })
  const [lead, setLead] = useState({ nombre: '', whatsapp: '' })
  // Assigned once at session start; stays fixed for the lifetime of the provider
  const [abTestGroup] = useState(() => (Math.random() < 0.5 ? 'pdf' : 'call'))

  useEffect(() => {
    trackEvent('funnel_entry', { tipo: entryPoint, placement: adPlacement })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        entryPoint,
        adPlacement,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  )
}
