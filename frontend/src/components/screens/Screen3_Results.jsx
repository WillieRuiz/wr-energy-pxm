import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'
import ProgressBar from '../layout/ProgressBar.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { saveLead } from '../../services/api.js'
import { buildWhatsAppUrl } from '../../utils/whatsapp.js'
import { calcPricing } from '../../utils/pricing.js'

// TODO: Create your Calendly event and set VITE_CALENDLY_URL in Netlify before
// the "call" A/B group is functional in production.
const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || ''

const PHONE_RE = /^\+?[\d\s\-(). ]{10,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form, t) {
  const errs = {}
  if (!form.nombre || form.nombre.trim().length < 2) errs.nombre = t('screen3.error_nombre')
  if (!form.whatsapp || !PHONE_RE.test(form.whatsapp)) errs.whatsapp = t('screen3.error_whatsapp')
  if (form.email && !EMAIL_RE.test(form.email)) errs.email = t('screen3.error_email')
  return errs
}

export default function Screen3_Contact() {
  const { t, i18n } = useTranslation()
  const { results, getSelectedRows, hoursBackup, abTestGroup } = useCalculator()

  useEffect(() => {
    trackEvent('screen_view', { pantalla: 'results' })
    trackEvent('ab_test_assigned', { group: abTestGroup })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState({ nombre: '', whatsapp: '', email: '' })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(form, t)
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))
  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = async () => {
    if (!isValid) return
    trackEvent('lead_form_submit')
    setLoading(true)
    const { requirements, recommendations } = results || {}
    const { ecoflow, enphase } = recommendations || {}
    const sistemaRecomendado = [ecoflow?.sistema, enphase?.sistema].filter(Boolean).join(' | ')
    const costoTotal = (ecoflow?.usd_precio || 0) + (enphase?.usd_precio || 0)
    const totalDemandW = requirements?.totalDemandW || 0
    const pricing = calcPricing(costoTotal, totalDemandW)
    try {
      await saveLead({
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        ...(form.email && { email: form.email }),
        sistema_recomendado: sistemaRecomendado,
        costo_total: costoTotal,
        precio_contado_mxn: pricing.contado,
        precio_msi_mxn: pricing.mensualidad,
        demanda_total_w: totalDemandW,
        potencia_necesaria_w: requirements?.systemPowerW || 0,
        capacidad_necesaria_kwh: requirements?.batteryKwhRequired || 0,
        horas_respaldo: hoursBackup,
        equipos: getSelectedRows().map((r) => ({
          equipo: r.equipo,
          cantidad: r.cantidad,
          potencia_w: r.potencia_w,
          demanda_w: r.demanda_w,
        })),
        ab_test_group: abTestGroup,
      })
    } catch {
      // Lead save failure doesn't block the user
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    const isCallGroup = abTestGroup === 'call'
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-3xl">✓</span>
        </div>
        <div>
          <h2 className="font-display font-bold text-azul-tormenta text-3xl mb-2">
            {t('screen3.success_title')}
          </h2>
          <p className="font-body text-gray-500">
            {isCallGroup ? t('screen3.success_body_call') : t('screen3.success_body')}
          </p>
        </div>
        {isCallGroup ? (
          <Button
            onClick={() => {
              trackEvent('calendly_click_results')
              window.open(CALENDLY_URL, '_blank')
            }}
            className="w-full text-base py-4"
          >
            {t('screen3.calendly_button')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              trackEvent('whatsapp_click_results')
              window.open(buildWhatsAppUrl(results, i18n.language), '_blank')
            }}
            className="w-full text-base py-4"
          >
            {t('screen3.whatsapp_button')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-10 flex flex-col gap-6">
      <ProgressBar current={3} />

      <div>
        <h2 className="font-display font-bold text-azul-tormenta text-3xl leading-tight mb-1">
          {t('screen3.title')}
        </h2>
        <p className="font-body text-gray-500 text-sm">{t('screen3.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label={`${t('screen3.name_label')} *`}
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          onBlur={() => handleBlur('nombre')}
          placeholder="Daniela Ramírez"
          error={touched.nombre ? errors.nombre : undefined}
        />
        <Input
          label={`${t('screen3.whatsapp_label')} *`}
          type="tel"
          value={form.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          onBlur={() => handleBlur('whatsapp')}
          placeholder="+52 954 123 4567"
          error={touched.whatsapp ? errors.whatsapp : undefined}
        />
        <Input
          label={t('screen3.email_label')}
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="tucorreo@ejemplo.com"
          error={touched.email ? errors.email : undefined}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full text-base py-4"
      >
        {loading ? '...' : `${t('screen3.submit_button')} →`}
      </Button>

      <p className="text-center text-xs text-gray-400 font-body">{t('screen3.privacy')}</p>
    </div>
  )
}
