import { shouldTrack } from './botFilter.js'

export function trackEvent(eventName, params = {}) {
  if (!shouldTrack()) return
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
