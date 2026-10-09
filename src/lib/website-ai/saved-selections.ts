import type { WebsiteContextAssessment } from "./assess-context";
import type { CheckboxOption } from "./capabilities";
import type { WebsiteGenerationIntent } from "./types";

function tick(options: CheckboxOption[], selected: readonly string[] | undefined): CheckboxOption[] {
  if (!selected?.length) return options;
  const set = new Set(selected);
  return options.map((opt) => ({
    ...opt,
    defaultChecked: opt.id === "HOME" || (!opt.disabled && set.has(opt.id)),
  }));
}

/** Start the page and capability checkboxes from the seller's last scaffold, not the defaults. */
export function withSavedSelections(
  assessment: WebsiteContextAssessment,
  intent: WebsiteGenerationIntent | undefined,
): WebsiteContextAssessment {
  if (!intent) return assessment;
  return {
    ...assessment,
    pageOptions: tick(assessment.pageOptions, intent.selectedPages),
    capabilityOptions: tick(assessment.capabilityOptions, intent.selectedCapabilities),
  };
}
