import type { DemoKit, DemoKitId } from "./types";
import { DEMO_KIT_IDS, isDemoKitId } from "./types";
import { GREEN_VALLEY_KIT } from "./green-valley";
import { MILL_AND_CRUMB_KIT } from "./mill-and-crumb";
import { NORTH_AND_FIELD_KIT } from "./north-and-field";

const KITS: Record<DemoKitId, DemoKit> = {
  "green-valley": GREEN_VALLEY_KIT,
  "mill-and-crumb": MILL_AND_CRUMB_KIT,
  "north-and-field": NORTH_AND_FIELD_KIT,
};

export function listDemoKits(): DemoKit[] {
  return DEMO_KIT_IDS.map((id) => KITS[id]);
}

export function getDemoKit(id: DemoKitId): DemoKit {
  return KITS[id];
}

export function resolveDemoKit(id: string | null | undefined): DemoKit | null {
  if (!id || !isDemoKitId(id)) return null;
  return KITS[id];
}

/** Default kit from seller business signals (Phase 8D.1 §3.7). */
export function recommendDemoKit(signals: {
  hasFarmStand?: boolean;
  hasMenus?: boolean;
  businessMode?: string | null;
  blueprintId?: string | null;
}): DemoKitId {
  const bp = signals.blueprintId ?? "";
  if (
    bp === "local" ||
    bp === "heritage" ||
    bp === "marketplace" ||
    signals.hasFarmStand
  ) {
    return "green-valley";
  }
  if (
    bp === "editorial" ||
    bp === "boutique" ||
    bp === "studio" ||
    signals.hasMenus ||
    signals.businessMode === "MENU" ||
    signals.businessMode === "FOOD_BUSINESS"
  ) {
    return "mill-and-crumb";
  }
  return "north-and-field";
}

export {
  DEMO_KIT_IDS,
  isDemoKitId,
  formatKitPrice,
  type DemoKit,
  type DemoKitId,
  type DemoKitCopy,
  type DemoKitAbout,
  type DemoKitProduct,
  type DemoKitCategory,
} from "./types";
export { resolveKitText, resolveKitCopyFields } from "./resolve-copy";
