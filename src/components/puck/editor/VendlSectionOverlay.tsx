"use client";

import { usePuck } from "@puckeditor/core";
import { sectionLabel, sectionRule } from "@/lib/puck/section-registry";
import { PUCK_ROOT_ZONE } from "@/lib/puck/editor-zone";
import { useEditorChrome } from "./EditorChromeContext";

export default function VendlSectionOverlay({
  children,
  hover,
  isSelected,
  componentType,
  componentId,
}: {
  children: React.ReactNode;
  hover: boolean;
  isSelected: boolean;
  componentId: string;
  componentType: string;
}) {
  const { dispatch, appState, getSelectorForId } = usePuck();
  const { setAddAtIndex } = useEditorChrome();
  const selector = getSelectorForId(componentId);
  const index = selector?.index ?? 0;
  const rule = sectionRule(componentType);
  const label = sectionLabel(componentType);

  return (
    <div
      className={`vendl-section-overlay ${isSelected ? "is-selected" : ""} ${hover && !isSelected ? "is-hover" : ""}`}
      data-vendl-section={componentType}
    >
      {isSelected ? (
        <div className="vendl-section-overlay__bar">
          <span className="vendl-section-overlay__label">{label}</span>
          <div className="vendl-section-overlay__actions">
            <button
              type="button"
              title="Move up"
              disabled={index <= 0}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: "reorder",
                  sourceIndex: index,
                  destinationIndex: index - 1,
                  destinationZone: PUCK_ROOT_ZONE,
                });
              }}
            >
              ↑
            </button>
            <button
              type="button"
              title="Move down"
              disabled={index >= appState.data.content.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: "reorder",
                  sourceIndex: index,
                  destinationIndex: index + 1,
                  destinationZone: PUCK_ROOT_ZONE,
                });
              }}
            >
              ↓
            </button>
            {!rule?.singleton ? (
              <button
                type="button"
                title="Duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({
                    type: "duplicate",
                    sourceIndex: index,
                    sourceZone: PUCK_ROOT_ZONE,
                  });
                }}
              >
                Duplicate
              </button>
            ) : null}
            {!rule?.required ? (
              <button
                type="button"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({
                    type: "remove",
                    index,
                    zone: PUCK_ROOT_ZONE,
                  });
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
      {isSelected ? (
        <button
          type="button"
          className="vendl-add-section-gap"
          onClick={(e) => {
            e.stopPropagation();
            setAddAtIndex(index + 1);
          }}
        >
          + Add section
        </button>
      ) : null}
    </div>
  );
}

export function VendlActionBarOverride({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
  parentAction: React.ReactNode;
}) {
  return <>{children}</>;
}
