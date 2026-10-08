/** Shared selected/unselected pill styling - delegates to app-wide design tokens. */

import {
  SELECTABLE_PILL_SELECTED,
  SELECTABLE_PILL_UNSELECTED,
  selectablePillClass as designSelectablePillClass,
} from '@/lib/design/tokens'

/** @deprecated Use SELECTABLE_PILL_SELECTED from lib/design/tokens */
export const COMPOSE_PILL_SELECTED = SELECTABLE_PILL_SELECTED

/** @deprecated Use SELECTABLE_PILL_UNSELECTED from lib/design/tokens */
export const COMPOSE_PILL_UNSELECTED = SELECTABLE_PILL_UNSELECTED

export function composePillClass(selected: boolean, disabled?: boolean): string {
  return designSelectablePillClass(selected, disabled)
}
