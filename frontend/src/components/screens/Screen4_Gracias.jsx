import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'

export default function Screen4_Gracias() {
  const { t } = useTranslation()

  useEffect(() => {
    trackEvent('screen_view', { pantalla: 'pago_gracias' })
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <span className="text-green-600 text-3xl">✓</span>
      </div>
      <div>
        <h2 className="font-display font-bold text-azul-tormenta text-3xl mb-2">
          {t('screen4.title')}
        </h2>
        <p className="font-body text-gray-500">{t('screen4.body')}</p>
      </div>
    </div>
  )
}
