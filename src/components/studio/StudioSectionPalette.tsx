"use client";

import { useEditor } from "@craftjs/core";
import {
  CATEGORY_LABELS,
  paletteSectionsForMode,
} from "@/lib/studio/section-registry";
import {
  findStudioCanvasParentId,
  studioSectionInsertIndex,
} from "@/lib/studio/page-canvas";
import { studioSectionElement } from "@/lib/studio/insert-section";
import type { StudioSectionType } from "@/lib/studio/types";
import { useStudioEditorChrome } from "./StudioEditorContext";

export default function StudioSectionPalette() {
  const {
    businessMode,
    paletteCollapsed,
    setPaletteCollapsed,
    commercePageKind,
  } = useStudioEditorChrome();
  const { connectors, actions, query } = useEditor();

  const nodes = query.getSerializedNodes() as Record<
    string,
    { type?: { resolvedName?: string } | string; nodes?: string[]; isCanvas?: boolean }
  >;
  const grouped = paletteSectionsForMode(nodes, businessMode, commercePageKind);

  function insertAtEnd(type: StudioSectionType) {
    const current = query.getSerializedNodes();
    const parentId = findStudioCanvasParentId(current);
    const index = studioSectionInsertIndex(current, parentId);
    const tree = query
      .parseReactElement(studioSectionElement(type))
      .toNodeTree();
    actions.addNodeTree(tree, parentId, index);
    actions.selectNode(tree.rootNodeId);
  }

  if (paletteCollapsed) {
    return (
      <aside className="vendl-studio-palette vendl-studio-palette--collapsed">
        <button
          type="button"
          className="vendl-studio-palette__expand"
          onClick={() => setPaletteCollapsed?.(false)}
          title="Show sections"
        >
          Sections
        </button>
      </aside>
    );
  }

  return (
    <aside className="vendl-studio-palette">
      <div className="vendl-studio-palette__head">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Add sections
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
          Drag onto your page or click to add.
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--muted)]"
          onClick={() => setPaletteCollapsed?.(true)}
        >
          Hide
        </button>
      </div>
      <div className="vendl-studio-palette__body">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <div key={cat} className="vendl-studio-palette__group">
              <p className="vendl-studio-palette__group-label">{CATEGORY_LABELS[cat]}</p>
              <ul className="vendl-studio-palette__list">
                {items.map((rule) => (
                  <li key={rule.type}>
                    <div
                      ref={(ref) => {
                        if (ref) {
                          connectors.create(
                            ref,
                            studioSectionElement(rule.type),
                          );
                        }
                      }}
                      className="vendl-studio-palette__item"
                      role="button"
                      tabIndex={0}
                      onClick={() => insertAtEnd(rule.type)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          insertAtEnd(rule.type);
                        }
                      }}
                    >
                      <span className="vendl-studio-palette__item-label">{rule.label}</span>
                      <span className="vendl-studio-palette__item-hint">{rule.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
