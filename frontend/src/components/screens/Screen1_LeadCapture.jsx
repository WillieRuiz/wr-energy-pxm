import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'

const PHONE_RE = /^\+?[\d\s\-(). ]{10,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form, t) {
  const errs = {}
  if (!form.nombre || form.nombre.trim().length < 2) errs.nombre = t('screen1.error_nombre')
  if (!form.whatsapp || !PHONE_RE.test(form.whatsapp)) errs.whatsapp = t('screen1.error_whatsapp')
  if (form.email && !EMAIL_RE.test(form.email)) errs.email = t('screen1.error_email')
  return errs
}

export default function Screen1_LeadCapture() {
  const { t } = useTranslation()
  const { setLead, goToScreen } = useCalculator()

  const [form, setForm] = useState({ nombre: '', whatsapp: '', email: '' })
  const [touched, setTouched] = useState({})

  const errors = validate(form, t)
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = () => {
    setLead(form)
    goToScreen(2)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display font-bold text-azul-tormenta text-h1-mobile lg:text-h1-desktop leading-tight mb-2">
          {t('screen1.headline')}
        </h1>
        <p className="font-body text-gray-500">{t('screen1.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label={`${t('screen1.name_label')} *`}
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          onBlur={() => handleBlur('nombre')}
          placeholder="Daniela Ramírez"
          error={touched.nombre ? errors.nombre : undefined}
        />
        <Input
          label={`${t('screen1.whatsapp_label')} *`}
          type="tel"
          value={form.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          onBlur={() => handleBlur('whatsapp')}
          placeholder="+52 954 123 4567"
          error={touched.whatsapp ? errors.whatsapp : undefined}
        />
        <Input
          label={t('screen1.email_label')}
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="tucorreo@ejemplo.com"
          error={touched.email ? errors.email : undefined}
        />
      </div>

      <Button onClick={handleSubmit} disabled={!isValid} className="w-full text-base py-4">
        {t('screen1.next_button')} →
      </Button>

      <p className="text-center text-xs text-gray-400 font-body">{t('screen1.privacy')}</p>
    </div>
  )
}
