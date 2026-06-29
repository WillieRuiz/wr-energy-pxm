// In dev: leave VITE_API_URL unset — Vite proxy handles the backend calls (no CORS).
// In prod: set VITE_API_URL to the Railway backend URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const getEquipment = () => request('/get-equipment')

export const getSystems = () => request('/get-systems')

// Calls POST /recommend and converts snake_case response to camelCase
export const recommend = ({ equipos, horas_respaldo }) =>
  request('/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipos, horas_respaldo }),
  }).then((res) => ({
    requirements: {
      totalDemandW: res.requirements.total_demand_w,
      systemPowerW: res.requirements.system_power_w,
      batteryKwhRequired: res.requirements.battery_kwh_required,
      hoursBackup: res.requirements.hours_backup,
      aplicaInstalacion: res.requirements.aplica_instalacion,
    },
    recommendations: res.recommendations,
  }))

export const saveLead = (data) =>
  request('/save-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
