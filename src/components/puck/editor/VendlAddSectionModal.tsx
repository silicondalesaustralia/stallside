"use client";

import { usePuck } from "@puckeditor/core";
import { useEditorChrome } from "./EditorChromeContext";
import {
  availableSections,
  recommendedSections,
  sectionsByCategory,
  type SectionRule,
  sectionLabel,
} from "@/lib/puck/section-registry";
import { PUCK_ROOT_ZONE } from "@/lib/puck/editor-zone";
import type { SectionType } from "@/lib/puck/section-registry";

const CATEGORY_TITLES = {
  sell: "Sell",
  content: "Content",
  business: "Business",
} as const;

export default function VendlAddSectionModal() {
  const { addAtIndex, setAddAtIndex, metadata, businessMode } =
    useEditorChrome();
  const { dispatch, appState } = usePuck();

  if (addAtIndex === null) return null;

  const content = appState.data.content ?? [];
  const available = availableSections(content, businessMode);
  const recommended = recommendedSections(content, businessMode);
  const grouped = sectionsByCategory(
    available.filter((s) => !recommended.some((r) => r.type === s.type)),
  );

  function insert(type: SectionType) {
    const index = addAtIndex;
    if (index === null) return;
    dispatch({
      type: "insert",
      componentType: type,
      destinationIndex: index,
      destinationZone: PUCK_ROOT_ZONE,
    });
    dispatch({
      type: "setUi",
      ui: {
        itemSelector: { index, zone: PUCK_ROOT_ZONE },
        rightSideBarVisible: true,
      },
    });
    setAddAtIndex(null);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-labelledby="add-section-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 id="add-section-title" className="text-lg font-bold text-[var(--field)]">
            Add a section
          </h2>
          <button
            type="button"
            onClick={() => setAddAtIndex(null)}
            className="text-sm font-semibold text-[var(--muted)]"
          >
            Cancel
          </button>
        </div>
        <div className="space-y-6 p-5">
          {recommended.length > 0 ? (
            <SectionGroup title="Recommended for you">
              <div className="grid grid-cols-2 gap-3">
                {recommended.map((rule) => (
                  <RecommendCard
                    key={rule.type}
                    rule={rule}
                    onPick={() => insert(rule.type)}
                  />
                ))}
              </div>
            </SectionGroup>
          ) : null}
          {(Object.keys(CATEGORY_TITLES) as Array<keyof typeof CATEGORY_TITLES>).map(
            (key) =>
              grouped[key].length > 0 ? (
                <SectionGroup key={key} title={CATEGORY_TITLES[key]}>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {grouped[key].map((rule) => (
                      <li key={rule.type}>
                        <button
                          type="button"
                          onClick={() => insert(rule.type)}
                          className="w-full rounded-xl border border-[var(--line)] px-3 py-2 text-left text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]"
                        >
                          {rule.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </SectionGroup>
              ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

function SectionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function RecommendCard({
  rule,
  onPick,
}: {
  rule: SectionRule;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-4 text-left hover:border-[var(--field)]"
    >
      <p className="font-semibold text-[var(--field)]">{rule.label}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{rule.description}</p>
    </button>
  );
}

export function VendlCanvasAddFooter() {
  const { setAddAtIndex } = useEditorChrome();
  const { appState } = usePuck();
  const index = appState.data.content?.length ?? 0;

  return (
    <div className="flex justify-center border-t border-dashed border-[var(--line)] bg-[var(--wash)] py-6">
      <button
        type="button"
        onClick={() => setAddAtIndex(index)}
        className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--field)] shadow-sm hover:bg-[var(--panel)]"
      >
        + Add section
      </button>
    </div>
  );
}

export function VendlSectionsPanel() {
  const { showSectionsPanel, setShowSectionsPanel } = useEditorChrome();
  const { appState, dispatch } = usePuck();

  if (!showSectionsPanel) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/20">
      <aside className="h-full w-full max-w-sm overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <h2 className="font-bold text-[var(--field)]">Sections</h2>
          <button
            type="button"
            onClick={() => setShowSectionsPanel(false)}
            className="text-sm font-semibold text-[var(--muted)]"
          >
            Close
          </button>
        </div>
        <ol className="divide-y divide-[var(--line)]">
          {(appState.data.content ?? []).map((item, index) => (
            <li key={item.props?.id ?? index}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[var(--wash)]"
                onClick={() => {
                  dispatch({
                    type: "setUi",
                    ui: {
                      itemSelector: { index, zone: PUCK_ROOT_ZONE },
                      rightSideBarVisible: true,
                    },
                  });
                  setShowSectionsPanel(false);
                }}
              >
                <span className="font-semibold">{sectionLabel(item.type)}</span>
                <span className="text-[var(--muted)]">Edit</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
