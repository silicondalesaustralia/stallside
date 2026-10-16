import type { ModelSectionType } from "../ai/schemas";
import { LOOK_HOME_MAX, LOOK_SECTION_TYPES, lookSectionOptions, type BriefLook } from "../brief/look";
import type { PageTarget } from "./targets";

/** A fuller homepage order for "Full"; only sections with real data are kept. */
const FULL_HOME: ModelSectionType[] = [
  "hero", "productGrid", "categories", "nextDrop", "imageText", "farmStand", "reviews", "pickup", "faq", "payments", "signup",
];

/**
 * The homepage shaped by the seller's Look & features answers: how many sections, and which of
 * reviews / visit us / pre-orders / newsletter / FAQ must appear or stay off.
 */
export function homeTargetWithLook(target: PageTarget, look: BriefLook, available: Set<ModelSectionType>): PageTarget {
  if (target.kind !== "home") return target;
  let allowed = target.allowedSections;
  let required = target.requiredSections;
  let defaults = look.richness === "full" ? FULL_HOME.filter((t) => allowed.includes(t)) : target.defaultSections;

  if (look.sections) {
    const offered = lookSectionOptions(available).map((s) => LOOK_SECTION_TYPES[s]);
    const chosen = new Set(look.sections.map((s) => LOOK_SECTION_TYPES[s]).filter((t) => offered.includes(t)));
    const dropped = new Set(offered.filter((t) => !chosen.has(t)));
    allowed = allowed.filter((t) => !dropped.has(t));
    required = [...required, ...[...chosen].filter((t) => !required.includes(t))];
    defaults = [...defaults.filter((t) => !dropped.has(t)), ...[...chosen].filter((t) => !defaults.includes(t))];
  }

  const maxSections = Math.max(LOOK_HOME_MAX[look.richness], required.length);
  const optionalRoom = maxSections - required.filter((t) => defaults.includes(t)).length;
  const optional = defaults.filter((t) => !required.includes(t)).slice(0, Math.max(0, optionalRoom));
  return {
    ...target,
    allowedSections: allowed,
    requiredSections: required,
    maxSections,
    defaultSections: defaults.filter((t) => required.includes(t) || optional.includes(t)),
  };
}
