import { useTranslation } from 'react-i18next'
import i18n from '../../i18n/index.js'

export default function LanguageToggle() {
  const { i18n: i18nHook } = useTranslation()
  const isEs = i18nHook.language.startsWith('es')

  const toggle = () => {
    const next = isEs ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="text-sm font-body font-medium text-white border border-white/30 rounded px-2 py-1 hover:bg-white/10 transition-colors"
    >
      {isEs ? 'EN' : 'ES'}
    </button>
  )
}
