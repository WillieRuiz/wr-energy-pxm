import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'
import { trackPixelViewContent, trackPixelLead, trackPixelContact } from '../../utils/pixelEvents.js'
import Button from '../ui/Button.jsx'
import { useCalculator } from '../../hooks/useCalculator.js'
import { saveLead } from '../../services/api.js'
import { buildWhatsAppUrl } from '../../utils/whatsapp.js'
import { validateLead } from '../../utils/validation.js'
import { buildLeadPayload } from '../../utils/leadPayload.js'

// TODO: Create your Calendly event and set VITE_CALENDLY_URL in Netlify before
// the "call" A/B group is functional in production.
const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || ''

// TODO(transitional): Screen2 ("sistema propuesto") now has its own "Pagar ahora" /
// "Contactar a Willie" CTAs that also save the lead and fire lead_form_submit/trackPixelLead,
// so most users convert there and never reach this screen. This one still serves the "call"
// A/B group (Calendly) and acts as a fallback WhatsApp confirmation. Revisit whether this
// screen is still needed once we confirm the Screen2 flow covers everyone well — don't
// remove it yet.

export default function Screen3_Contact() {
  const { t, i18n } = useTranslation()
  const { results, getSelectedRows, hoursBackup, abTestGroup, adPlacement, lead } = useCalculator()

  useEffect(() => {
    trackEvent('screen_view', { pantalla: 'datos_contacto' })
    trackPixelViewContent('datos_contacto')
    trackEvent('ab_test_assigned', { group: abTestGroup })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const errors = validateLead(lead, t)
  const isLeadValid = Object.keys(errors).length === 0

  // Fire-and-forget: must not be awaited before the window.open() calls below,
  // or the browser blocks the popup.
  const handleLeadConversion = () => {
    if (!isLeadValid) return
    trackEvent('lead_form_submit', { placement: adPlacement })
    trackPixelLead()
    saveLead(
      buildLeadPayload({ lead, results, getSelectedRows, hoursBackup, abTestGroup, language: i18n.language })
    ).catch(() => {
      // Lead save failure doesn't block the user
    })
  }

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
            handleLeadConversion()
            trackEvent('calendly_click_results')
            trackPixelContact('calendly')
            window.open(CALENDLY_URL, '_blank')
          }}
          className="w-full text-base py-4"
        >
          {t('screen3.calendly_button')}
        </Button>
      ) : (
        <Button
          onClick={() => {
            handleLeadConversion()
            trackEvent('whatsapp_click_results', { placement: adPlacement })
            trackPixelContact('whatsapp')
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
