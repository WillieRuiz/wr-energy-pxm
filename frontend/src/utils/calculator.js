export function calculateRequirements(equipmentList, hoursBackup = 4) {
  const totalDemandW = equipmentList.reduce(
    (sum, item) => sum + item.cantidad * item.potencia_w,
    0
  )
  const systemPowerW = totalDemandW * 0.7
  const batteryKwhRequired = ((systemPowerW * hoursBackup) / 1000) * 0.4

  return { totalDemandW, systemPowerW, batteryKwhRequired, hoursBackup }
}

export function selectImmediateSuperior(systems, requiredKwh, requiredW, brand) {
  const brandSystems = systems.filter(
    (s) => s.marca.toLowerCase() === brand.toLowerCase()
  )
  const candidates = brandSystems.filter(
    // almacenamiento in kWh; potencia in kW → convert to W for comparison
    (s) => s.almacenamiento >= requiredKwh && s.potencia * 1000 >= requiredW
  )

  if (!candidates.length) {
    if (!brandSystems.length) return null
    const biggest = brandSystems.reduce((a, b) =>
      a.almacenamiento > b.almacenamiento ? a : b
    )
    return { ...biggest, needs_custom_quote: true }
  }

  candidates.sort(
    (a, b) => a.almacenamiento - b.almacenamiento || a.usd_precio - b.usd_precio
  )
  return { ...candidates[0], needs_custom_quote: false }
}

export function recommendSystems(equipmentList, systems, hoursBackup = 4) {
  const requirements = calculateRequirements(equipmentList, hoursBackup)
  const ecoflow = selectImmediateSuperior(
    systems,
    requirements.batteryKwhRequired,
    requirements.systemPowerW,
    'Ecoflow'
  )
  const enphase = selectImmediateSuperior(
    systems,
    requirements.batteryKwhRequired,
    requirements.systemPowerW,
    'Enphase'
  )

  return {
    requirements,
    recommendations: { ecoflow, enphase, victron_pytes: null },
  }
}
