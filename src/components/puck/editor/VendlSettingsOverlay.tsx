"use client";

import { usePuck } from "@puckeditor/core";
import { sectionLabel } from "@/lib/puck/section-registry";
import VendlSectionSettings from "./VendlSectionSettings";

export default function VendlSettingsOverlay() {
  const { selectedItem, dispatch } = usePuck();

  if (!selectedItem) return null;

  function close() {
    dispatch({
      type: "setUi",
      ui: { itemSelector: null, rightSideBarVisible: false },
    });
  }

  return (
    <div className="vendl-settings-overlay" role="dialog" aria-label="Edit section">
      <button
        type="button"
        aria-label="Close settings"
        className="vendl-settings-overlay__backdrop"
        onClick={close}
      />
      <div className="vendl-settings-overlay__panel">
        <div className="vendl-settings-overlay__header">
          <h2 className="text-sm font-bold text-[var(--field)]">
            {sectionLabel(selectedItem.type)}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg bg-[var(--field)] px-3 py-1 text-xs font-semibold text-white"
          >
            Done
          </button>
        </div>
        <div className="vendl-settings-overlay__body">
          <VendlSectionSettings />
        </div>
      </div>
    </div>
  );
}
