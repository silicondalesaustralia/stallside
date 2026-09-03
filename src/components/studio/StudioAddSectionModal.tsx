"use client";

import { useEditor } from "@craftjs/core";
import { findStudioCanvasParentId } from "@/lib/studio/page-canvas";
import { paletteSectionsForMode, studioSectionLabel } from "@/lib/studio/section-registry";
import { studioSectionElement } from "@/lib/studio/insert-section";
import type { StudioSectionType } from "@/lib/studio/types";
import { useStudioEditorChrome } from "./StudioEditorContext";

export default function StudioAddSectionModal() {
  const { addAtIndex, setAddAtIndex, businessMode, commercePageKind } =
    useStudioEditorChrome();
  const { actions, query } = useEditor();

  if (addAtIndex === null) return null;
  const insertIndex = addAtIndex;

  const nodes = query.getSerializedNodes() as Record<
    string,
    { type?: { resolvedName?: string } | string }
  >;
  const grouped = paletteSectionsForMode(nodes, businessMode, commercePageKind);
  const available = Object.values(grouped).flat();

  function insert(type: StudioSectionType) {
    const current = query.getSerializedNodes();
    const parentId = findStudioCanvasParentId(current);
    const tree = query.parseReactElement(studioSectionElement(type)).toNodeTree();
    actions.addNodeTree(tree, parentId, insertIndex);
    actions.selectNode(tree.rootNodeId);
    setAddAtIndex(null);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl" role="dialog">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--field)]">Add a section</h2>
          <button type="button" onClick={() => setAddAtIndex(null)} className="text-sm font-semibold text-[var(--muted)]">
            Cancel
          </button>
        </div>
        <ul className="divide-y divide-[var(--line)] p-2">
          {available.map((rule) => (
            <li key={rule.type}>
              <button
                type="button"
                onClick={() => insert(rule.type)}
                className="w-full rounded-xl px-4 py-3 text-left hover:bg-[var(--wash)]"
              >
                <p className="font-semibold text-[var(--field)]">{studioSectionLabel(rule.type)}</p>
                <p className="text-sm text-[var(--muted)]">{rule.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
