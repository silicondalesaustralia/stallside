/** GA event for the Free-to-Pro upgrade journey; no-op when analytics isn't loaded. Never send account details. */
export function trackProUpgrade(name: string, params: Record<string, string> = {}): void {
  try {
    window.gtag?.("event", name, params);
  } catch (error) {
    console.error(`[pro-upgrade] ${name} tracking failed`, error);
  }
}
