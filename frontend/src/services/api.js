const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

export const saveLead = (data) =>
  request('/save-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
