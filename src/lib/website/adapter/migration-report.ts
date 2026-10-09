import type { BusinessMode } from "@/lib/business-mode";
import type { Diagnostic } from "@/lib/website/schema/diagnostics";
import { validateWebsiteDefinition } from "@/lib/website/schema/validate";
import { craftPageToSections } from "./from-craft";
import { storefrontConfigToDefinition } from "./from-config";
import { sectionsToCraftNodes } from "./to-craft";

export type ConfigMigrationReport = {
  pages: number;
  sectionPages: number;
  legacyPages: number;
  sections: number;
  lossless: boolean;
  errors: Diagnostic[];
  warnings: Diagnostic[];
};

/** Read-only: converts one stored config and checks it would validate and round-trip. */
export function reportConfigMigration(raw: unknown, businessMode: BusinessMode): ConfigMigrationReport {
  const { definition, diagnostics } = storefrontConfigToDefinition(raw, businessMode);
  const validated = validateWebsiteDefinition(definition);
  const all = [...diagnostics, ...validated.diagnostics];
  const pages = Object.values(definition.pages);
  const lossless = pages.every((page) => {
    const back = craftPageToSections(sectionsToCraftNodes(page.sections), "check");
    return JSON.stringify(back.sections) === JSON.stringify(page.sections);
  });
  return {
    pages: pages.length,
    sectionPages: pages.filter((p) => p.layoutSource === "sections").length,
    legacyPages: pages.filter((p) => p.layoutSource === "legacy").length,
    sections: pages.reduce((n, p) => n + p.sections.length, 0),
    lossless,
    errors: all.filter((d) => d.severity === "error"),
    warnings: all.filter((d) => d.severity === "warning"),
  };
}
