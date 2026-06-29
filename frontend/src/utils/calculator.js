// Reference implementation — mirrors backend/app/services/calculator.py (§3 of plan.md).
// The actual recommendation now runs server-side via POST /recommend.

const UMBRAL_DEMANDA_KW = 3.0
const FACTOR_DEMANDA = 0.70
const FACTOR_USO_RESPALDO = 0.40
const TOLERANCIA_ESTACION_W = 300.0

export function calculateRequirements(equipmentList, hoursBackup = 4) {
  const totalDemandW = equipmentList.reduce(
    (sum, item) => sum + item.cantidad * item.potencia_w,
    0
  )
  const dKw = totalDemandW / 1000
  const systemPowerW = dKw < UMBRAL_DEMANDA_KW
    ? totalDemandW
    : totalDemandW * FACTOR_DEMANDA
  const batteryKwhRequired = (systemPowerW * hoursBackup) / 1000 * FACTOR_USO_RESPALDO

  return {
    totalDemandW,
    systemPowerW,
    batteryKwhRequired,
    hoursBackup,
    aplicaInstalacion: dKw >= UMBRAL_DEMANDA_KW,
  }
}
