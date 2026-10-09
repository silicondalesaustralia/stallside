import type { SerializedNodes } from "@craftjs/core";
import { placeholderSeverity, type PlaceholderKind } from "@/lib/website-ai/placeholders";

type StudioNode = SerializedNodes[string];

type NodeCustom = {
  visibility?: string;
  placeholderKind?: PlaceholderKind;
};

function nodeCustom(node: StudioNode): NodeCustom {
  const custom = (node as { custom?: unknown }).custom;
  return custom && typeof custom === "object" ? (custom as NodeCustom) : {};
}

/** False for hidden, editor-only and not-yet-live placeholder sections. */
export function isPublicStudioNode(node: StudioNode | undefined): boolean {
  if (!node) return false;
  if ((node as { hidden?: boolean }).hidden === true) return false;
  const custom = nodeCustom(node);
  if (custom.visibility === "EDITOR_ONLY") return false;
  if (custom.placeholderKind && placeholderSeverity(custom.placeholderKind) === "NOT_LIVE") {
    return false;
  }
  return true;
}

const INSTRUCTIONAL_COPY = /^Tell customers [\s\S]*…$/;

/** True when a public section still contains instructional placeholder text. */
export function hasInstructionalCopy(node: StudioNode): boolean {
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  return Object.values(props).some(
    (value) => typeof value === "string" && INSTRUCTIONAL_COPY.test(value.trim()),
  );
}
