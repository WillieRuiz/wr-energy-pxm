// Filtra tráfico no-humano antes de que llegue a GA4 o al Pixel de Meta.
//
// Cubre dos casos distintos:
// 1. Bots/crawlers clásicos (user-agent conocido) — Googlebot, Bingbot, etc.
//    GA4 ya excluye los más comunes de motores de búsqueda automáticamente,
//    esto es una capa extra para otros casos (LinkedInBot, TelegramBot, etc.)
// 2. Precarga fantasma de Meta: cuando alguien recibe un link en Messenger,
//    la app a veces pre-carga la página en segundo plano para que abra más
//    rápido si la persona decide entrar. Eso ejecuta el JS completo (dispara
//    nuestros eventos) sin que haya un humano viendo la pantalla — se detecta
//    porque la pestaña no está visible/enfocada en el momento de la carga.

const BOT_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /facebookexternalhit/i,
  /meta-externalagent/i,
  /whatsapp/i,
  /telegrambot/i,
  /slackbot/i,
  /linkedinbot/i,
  /discordbot/i,
  /googlebot/i,
  /bingbot/i,
  /headlesschrome/i,
]

function hasBotUserAgent() {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false
  return BOT_USER_AGENT_PATTERNS.some((pattern) => pattern.test(navigator.userAgent))
}

function isBackgroundPrerender() {
  if (typeof document === 'undefined') return false
  // Una pestaña precargada en segundo plano no está "visible" para el usuario.
  return document.visibilityState === 'hidden' || document.visibilityState === 'prerender'
}

export function shouldTrack() {
  return !hasBotUserAgent() && !isBackgroundPrerender()
}
