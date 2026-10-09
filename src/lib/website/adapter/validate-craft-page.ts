import type { SerializedNodes } from "@craftjs/core";
import type { BusinessMode } from "@/lib/business-mode";
import type { Diagnostic } from "@/lib/website/schema/diagnostics";
import type { PageKind } from "@/lib/website/sections/fields";
import { validatePage } from "@/lib/website/schema/validate";
import { craftPageToSections } from "./from-craft";

/** Seller-facing errors that block saving a Craft page (warnings are ignored). */
export function craftPageSaveErrors(
  nodes: SerializedNodes,
  kind: PageKind,
  businessMode?: BusinessMode,
): string[] {
  const { sections, diagnostics } = craftPageToSections(nodes, "page");
  const pageDiagnostics: Diagnostic[] = validatePage(
    { id: "page", kind, slug: "", title: "", enabled: true, layoutSource: "sections", sections },
    "page",
    businessMode,
  );
  return [...new Set(
    [...diagnostics, ...pageDiagnostics]
      .filter((d) => d.severity === "error")
      .map((d) => d.message),
  )];
}
