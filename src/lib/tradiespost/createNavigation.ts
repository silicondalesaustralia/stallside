/** Custom event: sidebar/mobile Create tap while already on /create resets to selector. */
export const TRADIESPOST_CREATE_RESET_EVENT = 'tradiespost:create-reset'

export function dispatchTradiesPostCreateReset() {
  window.dispatchEvent(new CustomEvent(TRADIESPOST_CREATE_RESET_EVENT))
}
