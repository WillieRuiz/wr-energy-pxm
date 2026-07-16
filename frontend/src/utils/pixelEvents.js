// Utilidades para el Meta Pixel (fbq). El script base ya vive en index.html.
// Este archivo dispara eventos en los mismos puntos que analytics.js (GA4),
// mapeados a eventos estándar de Meta cuando aplica, para poder usarlos
// como objetivo de optimización al crear campañas en Ads Manager.

function fbqSafe(...args) {
  if (typeof window.fbq === 'function') {
    window.fbq(...args)
  }
}

export function trackPixelLead() {
  fbqSafe('track', 'Lead')
}

export function trackPixelContact(method) {
  fbqSafe('track', 'Contact', { contact_method: method })
}

export function trackPixelViewContent(contentName) {
  fbqSafe('track', 'ViewContent', { content_name: contentName })
}

export function trackPixelCustom(eventName, params = {}) {
  fbqSafe('trackCustom', eventName, params)
}
