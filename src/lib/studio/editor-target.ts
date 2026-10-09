import { commerceKindFromParam, type CommercePageKind } from "./commerce-pages";
import { studioPreviewEditPath } from "./return-to";

/** Which page the storefront editor is open on, carried in `?page=`. */
export type EditorTarget =
  | { kind: "home" }
  | { kind: "page"; pageId: string }
  | { kind: "commerce"; commerceKind: CommercePageKind };

export function parseEditorTarget(raw: string | undefined): EditorTarget {
  if (raw?.startsWith("page:")) {
    const pageId = raw.slice(5).trim();
    if (pageId) return { kind: "page", pageId };
  }
  if (raw?.startsWith("commerce:")) {
    const commerceKind = commerceKindFromParam(raw.slice(9));
    if (commerceKind) return { kind: "commerce", commerceKind };
  }
  return { kind: "home" };
}

export function editorTargetParam(target: EditorTarget): string {
  if (target.kind === "page") return `page:${target.pageId}`;
  if (target.kind === "commerce") return `commerce:${target.commerceKind}`;
  return "home";
}

export function studioEditorPath(slug: string, target: EditorTarget = { kind: "home" }): string {
  const base = studioPreviewEditPath(slug);
  if (target.kind === "home") return base;
  return `${base}&page=${encodeURIComponent(editorTargetParam(target))}`;
}
