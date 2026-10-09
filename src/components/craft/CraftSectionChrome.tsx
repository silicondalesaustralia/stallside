"use client";

import type { ReactNode } from "react";
import { createElement, useMemo } from "react";
import SectionStyleFrame from "@/components/studio/SectionStyleFrame";
import { parseSectionStyle } from "@/lib/website/sections/section-style";
import { paletteOf } from "@/lib/website/sections/colour";
import { useEditor, useNode } from "@craftjs/core";
import { craftSectionLabel, craftSectionRule } from "@/lib/craft/section-registry";
import {
  studioSectionLabel,
  studioSectionRule,
} from "@/lib/studio/section-registry";
import { useCraftEditorChrome } from "./CraftEditorContext";

export default function CraftSectionChrome({
  children,
  onAddBelow,
}: {
  children: ReactNode;
  onAddBelow?: () => void;
}) {
  const { id, selected, hovered, rawStyle } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered,
    rawStyle: (node.data.props as Record<string, unknown>).style,
  }));
  const { actions, query } = useEditor();
  const { setAddAtIndex, registryMode = "craft", metadata } = useCraftEditorChrome();
  const sectionStyle = useMemo(() => parseSectionStyle(rawStyle), [rawStyle]);
  const labelFn = registryMode === "studio" ? studioSectionLabel : craftSectionLabel;
  const ruleFn = registryMode === "studio" ? studioSectionRule : craftSectionRule;
  const displayName = query.node(id).get().data.displayName ?? "";
  const label = labelFn(displayName);
  const rule = ruleFn(displayName);

  const parentId = query.node(id).get().data.parent;
  const siblings = parentId ? query.node(parentId).childNodes() : [];
  const index = siblings.indexOf(id);

  function moveBy(delta: number) {
    if (!parentId) return;
    const next = index + delta;
    if (next < 0 || next >= siblings.length) return;
    // Craft inserts before removing the old slot, so moving down needs one extra.
    actions.move(id, parentId, delta > 0 ? next + 1 : next);
  }

  function duplicate() {
    if (rule?.singleton || !parentId) return;
    const node = query.node(id).get();
    const { type, props } = node.data;
    if (typeof type !== "function") return;
    const tree = query
      .parseReactElement(createElement(type as React.ComponentType<typeof props>, { ...props }))
      .toNodeTree();
    actions.addNodeTree(tree, parentId, index + 1);
  }

  function remove() {
    if (rule?.required) return;
    actions.delete(id);
    actions.selectNode(undefined);
  }

  return (
    <div
      className={`craft-section ${selected ? "is-selected" : ""} ${hovered && !selected ? "is-hover" : ""}`}
    >
      {(selected || hovered) && (
        <div className="craft-section__bar" aria-hidden={!selected}>
          <span className="craft-section__label">{label}</span>
          {selected ? (
            <div className="craft-section__actions">
              <button type="button" title="Move up" disabled={index <= 0} onClick={() => moveBy(-1)}>
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={index >= siblings.length - 1}
                onClick={() => moveBy(1)}
              >
                ↓
              </button>
              {!rule?.singleton ? (
                <button type="button" title="Duplicate" onClick={duplicate}>
                  Duplicate
                </button>
              ) : null}
              {!rule?.required ? (
                <button type="button" title="Delete" onClick={remove}>
                  Delete
                </button>
              ) : null}
            </div>
          ) : (
            <span className="craft-section__hint">Edit</span>
          )}
        </div>
      )}
      <SectionStyleFrame sectionStyle={sectionStyle} palette={paletteOf(metadata.resolvedBranding)}>
        {children}
      </SectionStyleFrame>
      {selected ? (
        <button
          type="button"
          className="vendl-add-section-gap"
          onClick={() => {
            if (onAddBelow) onAddBelow();
            else setAddAtIndex(index + 1);
          }}
        >
          + Add section
        </button>
      ) : null}
    </div>
  );
}
