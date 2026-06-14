import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProgressBar from '../layout/ProgressBar.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { saveLead } from '../../services/api.js'
import { buildWhatsAppUrl } from '../../utils/whatsapp.js'

const PHONE_RE = /^\+?[\d\s\-(). ]{10,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form, t) {
  const errs = {}
  if (!form.nombre || form.nombre.trim().length < 2) errs.nombre = t('screen2.error_nombre')
  if (!form.whatsapp || !PHONE_RE.test(form.whatsapp)) errs.whatsapp = t('screen2.error_whatsapp')
  if (form.email && !EMAIL_RE.test(form.email)) errs.email = t('screen2.error_email')
  return errs
}

export default function Screen2_LeadCapture() {
  const { t, i18n } = useTranslation()
  const { equipmentList, hoursBackup, results, setLead } = useCalculator()

  const [form, setForm] = useState({ nombre: '', whatsapp: '', email: '' })
  const [touched, setTouched] = useState({})

  const errors = validate(form, t)
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = () => {
    setLead(form)

    // Open WhatsApp synchronously to avoid popup blocker
    window.open(buildWhatsAppUrl(results, i18n.language), '_blank')

    // Save lead in background without blocking the redirect
    const validRows = equipmentList.filter((r) => r.equipo && r.cantidad > 0)
    const { requirements, recommendations } = results || {}
    const { ecoflow, enphase } = recommendations || {}
    saveLead({
      nombre: form.nombre,
      whatsapp: form.whatsapp,
      ...(form.email && { email: form.email }),
      sistema_recomendado: [ecoflow?.sistema, enphase?.sistema].filter(Boolean).join(' | '),
      costo_total: (ecoflow?.usd_precio || 0) + (enphase?.usd_precio || 0),
      demanda_total_w: requirements?.totalDemandW || 0,
      potencia_necesaria_w: requirements?.systemPowerW || 0,
      capacidad_necesaria_kwh: requirements?.batteryKwhRequired || 0,
      horas_respaldo: hoursBackup,
      equipos: validRows.map((r) => ({
        equipo: r.equipo,
        cantidad: r.cantidad,
        potencia_w: r.potencia_w,
        demanda_w: r.cantidad * r.potencia_w,
      })),
    }).catch(() => {})
  }

  const { requirements } = results || {}

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-10 flex flex-col gap-6">
      <ProgressBar current={2} total={2} />

      {requirements && (
        <div className="bg-azul-tormenta text-white rounded-2xl p-5 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-mono text-2xl font-medium">
              {(requirements.totalDemandW / 1000).toFixed(1)} kW
            </div>
            <div className="text-xs text-white/60 font-body mt-1">{t('screen2.metric_demand')}</div>
          </div>
          <div className="border-l border-white/20">
            <div className="font-mono text-2xl font-medium">
              {requirements.batteryKwhRequired.toFixed(1)} kWh
            </div>
            <div className="text-xs text-white/60 font-body mt-1">{t('screen2.metric_capacity')}</div>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="font-display font-bold text-azul-tormenta text-2xl leading-tight mb-1">
          {t('screen2.headline')}
        </h2>
        <p className="font-body text-gray-500 text-sm">{t('screen2.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label={`${t('screen2.name_label')} *`}
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          onBlur={() => handleBlur('nombre')}
          placeholder="Daniela Ramírez"
          error={touched.nombre ? errors.nombre : undefined}
        />
        <Input
          label={`${t('screen2.whatsapp_label')} *`}
          type="tel"
          value={form.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          onBlur={() => handleBlur('whatsapp')}
          placeholder="+52 954 123 4567"
          error={touched.whatsapp ? errors.whatsapp : undefined}
        />
        <Input
          label={t('screen2.email_label')}
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="tucorreo@ejemplo.com"
          error={touched.email ? errors.email : undefined}
        />
      </div>

      <Button variant="success" onClick={handleSubmit} disabled={!isValid} className="w-full text-base py-4">
        {t('screen2.cta_button')}
      </Button>

      <p className="text-center text-xs text-gray-400 font-body">{t('screen2.privacy')}</p>
    </div>
  )
}
