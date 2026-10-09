"use server";

import type { SerializedNodes } from "@craftjs/core";
import { commerceKindFromParam } from "@/lib/studio/commerce-pages";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import {
  saveLayoutToDraft,
  type LayoutSaveResult,
  type LayoutTarget,
} from "@/lib/website/persistence/layout-save";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";

export type AutosaveResult = LayoutSaveResult | { ok: false; error: "failed"; message: string };

export type AutosaveTargetInput =
  | { kind: "home"; templateId: string }
  | { kind: "page"; pageId: string }
  | { kind: "commerce"; commerceKind: string };

const INVALID: AutosaveResult = { ok: false, error: "invalid", message: "Can't save: the layout is invalid." };

function parseTarget(input: AutosaveTargetInput): LayoutTarget | null {
  if (input.kind === "home") {
    const t = input.templateId;
    return t === "artisan" || t === "farmhouse" || t === "market" ? { kind: "home", templateId: t } : null;
  }
  if (input.kind === "page") {
    return typeof input.pageId === "string" && input.pageId.length > 0 && input.pageId.length <= 64
      ? { kind: "page", pageId: input.pageId }
      : null;
  }
  if (input.kind === "commerce") {
    const commerceKind = commerceKindFromParam(String(input.commerceKind));
    return commerceKind ? { kind: "commerce", commerceKind } : null;
  }
  return null;
}

function parseNodes(nodesJson: string): SerializedNodes | null {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    return validateStudioNodes(parsed).ok ? parsed : null;
  } catch {
    return null;
  }
}

/** Background draft save for the layout editor. Returns the new revision; never redirects. */
export async function autosaveWebsiteLayout(
  targetInput: AutosaveTargetInput,
  nodesJson: string,
  expectedRevision: number,
): Promise<AutosaveResult> {
  const { owner } = await requireWebsiteOwner();
  const target = parseTarget(targetInput);
  const nodes = parseNodes(nodesJson);
  if (!target || !nodes || !Number.isInteger(expectedRevision)) return INVALID;
  try {
    return await saveLayoutToDraft(owner, target, nodes, expectedRevision);
  } catch (err) {
    console.error("[website autosave] save failed", err);
    return { ok: false, error: "failed", message: "Couldn't save your changes. We'll keep trying." };
  }
}
