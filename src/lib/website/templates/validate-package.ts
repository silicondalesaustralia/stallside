import { findDemoAssetReferences } from "@/lib/website/demo-assets/reject-demo-assets";
import { error, type Diagnostic } from "@/lib/website/schema/diagnostics";
import { instantiateTemplate } from "./instantiate";
import { templatePackageSchema, type TemplatePackage } from "./package-schema";
import { unknownTokens, type TemplateSeller } from "./tokens";

const SPARSE_SELLER: Omit<TemplateSeller, "businessMode"> = { businessName: "A" };
const FULL_SELLER: Omit<TemplateSeller, "businessMode"> = {
  businessName: "Test Business",
  headline: "Test headline",
  subheadline: "Test subheadline",
  about: "About this business.",
  regionLabel: "Test region",
};

/**
 * Validates a package before it can be offered: structure, tokens, demo
 * assets, and that it instantiates cleanly for every business mode it claims,
 * with both sparse and complete seller data.
 */
export function validateTemplatePackage(raw: unknown): {
  pkg?: TemplatePackage;
  diagnostics: Diagnostic[];
} {
  const parsed = templatePackageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      diagnostics: parsed.error.issues.map((i) => error(i.path.map(String).join("."), i.message)),
    };
  }
  const pkg = parsed.data;
  const diagnostics: Diagnostic[] = [];

  for (const [pageId, slots] of Object.entries(pkg.pages)) {
    const seen = new Set<string>();
    for (const slot of slots ?? []) {
      const path = `pages.${pageId}.${slot.slot}`;
      if (seen.has(slot.slot)) diagnostics.push(error(path, `Slot "${slot.slot}" is used twice.`));
      seen.add(slot.slot);
      for (const value of Object.values(slot.props ?? {})) {
        if (typeof value !== "string") continue;
        for (const token of unknownTokens(value)) {
          diagnostics.push(error(path, `Unknown token {{business.${token}}}.`));
        }
      }
    }
  }
  for (const hit of findDemoAssetReferences(pkg)) {
    diagnostics.push(error("", `Demo asset reference not allowed: ${hit}`));
  }
  for (const businessMode of pkg.businessModes) {
    for (const seller of [SPARSE_SELLER, FULL_SELLER]) {
      const result = instantiateTemplate(pkg, { ...seller, businessMode });
      diagnostics.push(
        ...result.diagnostics
          .filter((d) => d.severity === "error")
          .map((d) => ({ ...d, path: `${businessMode}:${d.path}` })),
      );
    }
  }
  return diagnostics.some((d) => d.severity === "error") ? { diagnostics } : { pkg, diagnostics };
}
