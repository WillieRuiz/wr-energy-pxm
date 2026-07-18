import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../utils/analytics.js'
import { trackPixelLead, trackPixelContact } from '../../utils/pixelEvents.js'
import { useCalculator } from '../../hooks/useCalculator.js'
import { saveLead } from '../../services/api.js'
import { buildWhatsAppUrl, buildWhatsAppPaymentUrl } from '../../utils/whatsapp.js'
import { calcPricing } from '../../utils/pricing.js'
import { validateLead } from '../../utils/validation.js'
import { buildLeadPayload } from '../../utils/leadPayload.js'
import { getSystemDescription } from '../../utils/systemDescriptions.js'
import { getInstalledImages, getProductImage } from '../../utils/systemImages.js'
import Button from './Button.jsx'
import Gallery from './Gallery.jsx'
import HowItWorksDiagram from './HowItWorksDiagram.jsx'

function fmt(n) {
  return Math.round(n).toLocaleString('es-MX')
}

function ProductPhoto({ system, t }) {
  const src = getProductImage(system.codigo_estacion)
  // TODO: swap this placeholder for real product-only photos once they're uploaded
  // to public/images/estaciones/{codigo}_producto.png — none exist yet for any station.
  if (!src) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-azul-tormenta/5 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-center px-4">
        <span className="text-3xl">🔋</span>
        <p className="font-body text-xs text-gray-400">{system.sistema}</p>
        <p className="font-body text-[11px] text-gray-300">{t('screen2.product_photo_placeholder')}</p>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={system.sistema}
      loading="lazy"
      className="w-full aspect-[4/3] object-cover rounded-xl"
    />
  )
}

function PricingBlock({ system, totalDemandW, t }) {
  if (system.needs_custom_quote) {
    return (
      <p className="font-body text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        {t('screen2.custom_quote')}
      </p>
    )
  }
  const { contado, anticipo, saldo, mensualidad } = calcPricing(system.usd_precio, totalDemandW)
  return (
    <div className="space-y-3">
      {/* 12 MSI is the primary, most-visually-weighted option */}
      <div className="bg-azul-tormenta text-white rounded-xl p-4 relative">
        <span className="absolute -top-2 right-4 bg-amarillo-solar text-carbon text-[10px] font-display font-bold px-2 py-0.5 rounded uppercase tracking-wide">
          {t('screen2.msi_badge')}
        </span>
        <div className="text-xs text-white/60 font-body mb-1">{t('screen2.msi_label')}</div>
        <div className="font-mono text-2xl font-bold">
          ${fmt(mensualidad)}<span className="text-sm font-normal text-white/70">/mes</span>
        </div>
      </div>

      {/* Cash price stays visible, lower visual weight */}
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-body text-gray-500">{t('screen2.contado_label')}</span>
        <span className="font-mono text-gray-500">${fmt(contado)} MXN</span>
      </div>
      <div className="pl-3 border-l-2 border-gray-100 space-y-1 text-xs font-body text-gray-400">
        <div className="flex justify-between">
          <span>{t('screen2.anticipo_label')}</span>
          <span className="font-mono">${fmt(anticipo)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('screen2.saldo_label')}</span>
          <span className="font-mono">${fmt(saldo)}</span>
        </div>
      </div>
    </div>
  )
}

function RequirementsTable({ system, requirements, t }) {
  const yourPowerKw = (requirements.systemPowerW || 0) / 1000
  return (
    <div>
      <p className="font-body text-xs font-medium text-gray-500 mb-2">{t('screen2.table_title')}</p>
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="text-gray-400 text-[11px] uppercase tracking-wide">
            <th className="text-left font-medium pb-1"></th>
            <th className="text-right font-medium pb-1">{t('screen2.table_col_system')}</th>
            <th className="text-right font-medium pb-1">{t('screen2.table_col_needed')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="py-2 text-carbon">{t('screen2.table_row_capacity')}</td>
            <td className="py-2 text-right font-mono">{system.almacenamiento} kWh</td>
            <td className="py-2 text-right font-mono text-gray-400">
              {(requirements.batteryKwhRequired || 0).toFixed(1)} kWh
            </td>
          </tr>
          <tr>
            <td className="py-2 text-carbon">{t('screen2.table_row_power')}</td>
            <td className="py-2 text-right font-mono">{system.potencia} kW</td>
            <td className="py-2 text-right font-mono text-gray-400">{yourPowerKw.toFixed(1)} kW</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function SystemCard({ system, brand, totalDemandW }) {
  const { t, i18n } = useTranslation()
  const { results, getSelectedRows, hoursBackup, abTestGroup, adPlacement, lead } = useCalculator()

  if (brand === 'victron') {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-display font-bold text-azul-tormenta text-lg mb-1">Victron + Pytes</h3>
        <p className="font-body text-sm text-gray-400">{t('screen2.victron_placeholder')}</p>
      </div>
    )
  }
  if (!system) return null

  const errors = validateLead(lead, t)
  const isLeadValid = Object.keys(errors).length === 0
  const requirements = results?.requirements || {}
  const description = getSystemDescription(system.codigo_estacion, system.n_baterias)
  const installedImages = getInstalledImages(system.codigo_estacion, system.n_baterias)
  const steps = [t('screen2.step_1'), t('screen2.step_2'), t('screen2.step_3'), t('screen2.step_4')]

  // Fire-and-forget: must not be awaited before window.open(), or the browser blocks the popup.
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

  const handlePagarAhora = async () => {
    if (!isLeadValid) return
    trackEvent('lead_form_submit', { placement: adPlacement })
    trackPixelLead()

    let linkPago = ''
    try {
      const res = await saveLead(
        buildLeadPayload({ lead, results, getSelectedRows, hoursBackup, abTestGroup, language: i18n.language })
      )
      linkPago = res?.link_pago || ''
    } catch {
      // saveLead failed — fall through to the WhatsApp fallback below
    }

    // Same-tab redirect either way (not window.open()) — window.open() after an await
    // gets silently popup-blocked in most browsers, which made this button look like it
    // did nothing when link_pago came back empty. Only reached the WhatsApp branch if
    // Mercado Pago link generation failed server-side.
    window.location.href = linkPago || buildWhatsAppPaymentUrl(system.sistema, i18n.language)
  }

  const handleContactarWillie = () => {
    handleLeadConversion()
    trackEvent('whatsapp_click_results', { placement: adPlacement })
    trackPixelContact('whatsapp')
    window.open(buildWhatsAppUrl(results, i18n.language), '_blank')
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-2 ${!system.needs_custom_quote ? 'border-amarillo-solar' : 'border-gray-100'}`}>
      {/* 1. Name */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-bold text-azul-tormenta text-lg leading-tight">
          {system.sistema}
        </h3>
        {!system.needs_custom_quote && (
          <span className="ml-2 shrink-0 bg-amarillo-solar text-carbon text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {t('screen2.recommended')}
          </span>
        )}
      </div>
      <div className="flex gap-3 text-xs font-mono text-gray-400 mb-4">
        <span>{system.almacenamiento} kWh</span>
        <span>{system.potencia} kW</span>
        {system.acepta_smart_panel && (
          <span className="text-azul-tormenta">+ Smart Panel disponible</span>
        )}
      </div>

      {/* 2. Description */}
      {description && (
        <p className="font-body text-sm text-gray-600 leading-relaxed mb-4">{description}</p>
      )}

      {/* 3. Product photo (placeholder for now) + 4. Installed gallery */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ProductPhoto system={system} t={t} />
        {installedImages.length > 0 ? (
          <Gallery images={installedImages} alt={system.sistema} />
        ) : (
          <div className="aspect-[4/3] rounded-xl bg-gray-50 border border-gray-100" />
        )}
      </div>
      {installedImages.length > 0 && (
        <p className="font-body text-[11px] text-gray-400 mb-4 -mt-2">{t('screen2.gallery_title')}</p>
      )}

      {/* 5. How it works */}
      <p className="font-body text-xs font-medium text-gray-500 mb-2">{t('screen2.how_it_works_title')}</p>
      <div className="mb-4">
        <HowItWorksDiagram steps={steps} />
      </div>

      {/* 6. Requirements table */}
      <div className="mb-4">
        <RequirementsTable system={system} requirements={requirements} t={t} />
      </div>

      {/* 7-8. Pricing (MSI primary, contado secondary) */}
      <div className="mb-4">
        <PricingBlock system={system} totalDemandW={totalDemandW} t={t} />
      </div>

      {/* 9-10. CTAs */}
      {!system.needs_custom_quote && (
        <div className="flex flex-col gap-2">
          <Button onClick={handlePagarAhora} className="w-full">
            {t('screen2.pay_now_button')}
          </Button>
          <Button onClick={handleContactarWillie} variant="secondary" className="w-full">
            {t('screen2.contact_willie_button')}
          </Button>
        </div>
      )}
    </div>
  )
}
