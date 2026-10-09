"use client";

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useEditor } from "@craftjs/core";
import { findStudioCanvasParentId } from "@/lib/studio/page-canvas";
import { studioSectionLabel, studioSectionRule } from "@/lib/studio/section-registry";
import type { StudioSectionType } from "@/lib/studio/types";
import SectionThumbnail from "./SectionThumbnail";

type Row = { id: string; type: StudioSectionType; hidden: boolean };

/** Ordered list of the page's sections: select, and reorder with buttons or Alt+↑/↓. */
export default function StudioSectionOutline() {
  const { actions, parentId, childIds, rows, selectedId } = useEditor((state, query) => {
    const nodes = query.getSerializedNodes();
    const parent = findStudioCanvasParentId(nodes);
    const list: Row[] = [];
    for (const id of nodes[parent]?.nodes ?? []) {
      const node = nodes[id];
      const name = typeof node?.type === "string" ? node.type : node?.type?.resolvedName;
      if (!name || !studioSectionRule(name)) continue;
      list.push({ id, type: name as StudioSectionType, hidden: Boolean(node.hidden) });
    }
    const selected = [...state.events.selected][0] ?? null;
    return { parentId: parent, childIds: nodes[parent]?.nodes ?? [], rows: list, selectedId: selected };
  });
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);
  const drag = useRef<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    buttons.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [rows]);

  function moveTo(from: number, to: number) {
    if (from === to || to < 0 || to >= rows.length) return;
    const id = rows[from].id;
    const neighbour = childIds.indexOf(rows[to].id);
    // Craft inserts before removing the old slot, so moving down goes after the neighbour.
    actions.move(id, parentId, to > from ? neighbour + 1 : neighbour);
    pendingFocus.current = id;
  }

  function move(index: number, delta: number) {
    moveTo(index, index + delta);
  }

  function onDrop(e: DragEvent, to: number) {
    e.preventDefault();
    const from = rows.findIndex((r) => r.id === drag.current);
    drag.current = null;
    setOverIndex(null);
    if (from !== -1) moveTo(from, to);
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    move(index, e.key === "ArrowUp" ? -1 : 1);
  }

  if (rows.length === 0) return null;
  return (
    <div className="vendl-studio-palette__group">
      <p className="vendl-studio-palette__group-label">On this page</p>
      <p className="mb-1 text-[11px] text-[var(--muted)]">Drag to reorder, or Alt + ↑/↓ on the focused section.</p>
      <ol className="space-y-1">
        {rows.map((row, i) => {
          const label = studioSectionLabel(row.type);
          return (
            <li
              key={row.id}
              draggable
              onDragStart={(e) => {
                drag.current = row.id;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", row.id);
              }}
              onDragOver={(e) => {
                if (!drag.current) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overIndex !== i) setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
              onDrop={(e) => onDrop(e, i)}
              onDragEnd={() => {
                drag.current = null;
                setOverIndex(null);
              }}
              className={`flex cursor-grab items-center gap-1 rounded-md ${
                overIndex === i ? "ring-2 ring-[var(--leaf-dark)]" : ""
              }`}
            >
              <button
                type="button"
                ref={(el) => {
                  if (el) buttons.current.set(row.id, el);
                  else buttons.current.delete(row.id);
                }}
                aria-current={selectedId === row.id ? "true" : undefined}
                onClick={() => actions.selectNode(row.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs ${
                  selectedId === row.id ? "bg-[var(--wash)] font-semibold text-[var(--field)]" : "text-[var(--field)]"
                }`}
              >
                <SectionThumbnail type={row.type} />
                <span className="truncate">
                  {label}
                  {row.hidden ? " (hidden)" : ""}
                </span>
              </button>
              <button type="button" aria-label={`Move ${label} up`} disabled={i === 0} onClick={() => move(i, -1)} className="px-1 text-xs disabled:opacity-30">
                ↑
              </button>
              <button type="button" aria-label={`Move ${label} down`} disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="px-1 text-xs disabled:opacity-30">
                ↓
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
