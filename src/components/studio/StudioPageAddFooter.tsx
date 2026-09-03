"use client";

import { useEditor } from "@craftjs/core";
import {
  findStudioCanvasParentId,
  studioSectionInsertIndex,
} from "@/lib/studio/page-canvas";
import { useStudioEditorChrome } from "./StudioEditorContext";

export default function StudioPageAddFooter() {
  const { setAddAtIndex } = useStudioEditorChrome();
  const { query } = useEditor();

  function openAddModal() {
    const nodes = query.getSerializedNodes();
    const parentId = findStudioCanvasParentId(nodes);
    setAddAtIndex(studioSectionInsertIndex(nodes, parentId));
  }

  return (
    <div className="flex justify-center border-t border-dashed border-[var(--line)] bg-[#f5f5f4] py-6">
      <button
        type="button"
        onClick={openAddModal}
        className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--field)] shadow-sm"
      >
        + Add section
      </button>
    </div>
  );
}
