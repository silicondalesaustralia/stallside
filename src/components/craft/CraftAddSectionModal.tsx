"use client";

import { Element, useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { availableCraftSections } from "@/lib/craft/section-registry";
import { useCraftEditorChrome } from "./CraftEditorContext";
import CraftHeroSection from "./sections/CraftHeroSection";
import CraftProductGridSection from "./sections/CraftProductGridSection";
import CraftNextDropSection from "./sections/CraftNextDropSection";
import CraftAboutSection from "./sections/CraftAboutSection";
import type { CraftSectionType } from "@/lib/craft/types";

export default function CraftAddSectionModal() {
  const { addAtIndex, setAddAtIndex, businessMode } = useCraftEditorChrome();
  const { actions, query } = useEditor();

  if (addAtIndex === null) return null;
  const insertIndex = addAtIndex;

  const nodes = query.getSerializedNodes() as Record<
    string,
    { type?: { resolvedName?: string } | string }
  >;
  const available = availableCraftSections(nodes, businessMode);

  function insert(type: CraftSectionType) {
    let tree;
    switch (type) {
      case "CraftHeroSection":
        tree = query
          .parseReactElement(
            <Element
              is={CraftHeroSection}
              headline=""
              supportingText=""
              layout="simple"
              ctaLabel="Shop now"
              showCta
            />,
          )
          .toNodeTree();
        break;
      case "CraftProductGridSection":
        tree = query
          .parseReactElement(
            <Element
              is={CraftProductGridSection}
              source="all"
              categoryId=""
              productIds={[]}
              limit={8}
              layout="grid"
              columns={3}
              preset="classic"
              heading="Products"
              showPrice
              showAvailability
            />,
          )
          .toNodeTree();
        break;
      case "CraftNextDropSection":
        tree = query
          .parseReactElement(
            <Element
              is={CraftNextDropSection}
              maxItems={3}
              showClosingDate
              showPickupDate
              preset="card"
              heading="Next drop"
            />,
          )
          .toNodeTree();
        break;
      case "CraftAboutSection":
        tree = query
          .parseReactElement(
            <Element
              is={CraftAboutSection}
              heading="About us"
              body=""
              layout="simple"
            />,
          )
          .toNodeTree();
        break;
    }
    actions.addNodeTree(tree, ROOT_NODE, insertIndex);
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
                <p className="font-semibold text-[var(--field)]">{rule.label}</p>
                <p className="text-sm text-[var(--muted)]">{rule.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CraftPageAddFooter() {
  const { setAddAtIndex } = useCraftEditorChrome();
  const { query } = useEditor();
  const root = query.node(ROOT_NODE).get();
  const count = root.data.nodes?.length ?? 0;

  return (
    <div className="flex justify-center border-t border-dashed border-[var(--line)] bg-[#f5f5f4] py-6">
      <button
        type="button"
        onClick={() => setAddAtIndex(count)}
        className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--field)] shadow-sm"
      >
        + Add section
      </button>
    </div>
  );
}
