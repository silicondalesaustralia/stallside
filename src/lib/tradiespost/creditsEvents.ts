export const TRADIESPOST_CREDITS_CHANGED_EVENT = 'tradiespost:credits-changed'

/** Notify TradiesPost shell to refresh render balance (after generation or pack purchase). */
export function notifyTradiesPostCreditsChanged() {
  if (typeof window === 'undefined') return
  if (!window.location.hostname.includes('tradiespost')) return
  window.dispatchEvent(new CustomEvent(TRADIESPOST_CREDITS_CHANGED_EVENT))
}
