import { z } from "zod";
import type { BusinessMode } from "@/lib/business-mode";
import type { SectionInstance } from "@/lib/website/schema/definition";
import { error, type Diagnostic } from "@/lib/website/schema/diagnostics";
import type { PageKind } from "./fields";
import { isVendlSectionType, sectionDefinition } from "./registry";

function issuesToDiagnostics(issues: z.core.$ZodIssue[], path: string): Diagnostic[] {
  return issues.map((issue) =>
    error(
      [path, ...issue.path.map(String)].join("."),
      issue.code === "unrecognized_keys"
        ? `Unsupported field(s): ${issue.keys.join(", ")}.`
        : issue.message,
    ),
  );
}

function checkPart(schema: z.ZodObject, value: unknown, path: string): Diagnostic[] {
  const result = z.strictObject(schema.shape).safeParse(value ?? {});
  return result.success ? [] : issuesToDiagnostics(result.error.issues, path);
}

/** Validates one section against the registry. Unknown types are errors, never dropped. */
export function validateSection(
  section: SectionInstance,
  pageKind: PageKind,
  path: string,
  businessMode?: BusinessMode,
): Diagnostic[] {
  if (!isVendlSectionType(section.type)) {
    return [
      error(
        `${path}.type`,
        `Unknown section type "${section.type}". Remove the section or update Vendl before saving.`,
      ),
    ];
  }
  const def = sectionDefinition(section.type);
  const out: Diagnostic[] = [];
  if (section.schemaVersion > def.version) {
    out.push(
      error(
        `${path}.schemaVersion`,
        `${def.label} was saved by a newer version of Vendl (v${section.schemaVersion}). Reload the editor.`,
      ),
    );
  }
  if (!def.variants.includes(section.variant)) {
    out.push(error(`${path}.variant`, `${def.label} has no "${section.variant}" layout.`));
  }
  if (!def.pageKinds.includes(pageKind)) {
    out.push(error(path, `${def.label} can't be used on ${pageKind} pages.`));
  }
  if (businessMode && def.businessModes && !def.businessModes.includes(businessMode)) {
    out.push(error(path, `${def.label} isn't available for this kind of business.`));
  }
  out.push(...checkPart(def.content, section.content, `${path}.content`));
  out.push(...checkPart(def.settings, section.settings, `${path}.settings`));
  if (def.binding) out.push(...checkPart(def.binding, section.binding, `${path}.binding`));
  else if (section.binding && Object.keys(section.binding).length > 0) {
    out.push(error(`${path}.binding`, `${def.label} doesn't take a data source.`));
  }
  return out;
}
