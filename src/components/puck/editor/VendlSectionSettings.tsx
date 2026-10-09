"use client";

import { usePuck } from "@puckeditor/core";
import { resolvedSectionFields } from "@/lib/puck/section-settings";
import VendlSectionField, {
  useSectionPropUpdater,
} from "./VendlSectionField";

export default function VendlSectionSettings() {
  const { selectedItem } = usePuck();
  const updateProp = useSectionPropUpdater();

  if (!selectedItem) return null;

  const fields = resolvedSectionFields(selectedItem);
  const props = selectedItem.props as Record<string, unknown>;

  if (fields.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No settings for this section.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, field }) => (
        <div key={key} className="space-y-1.5">
          <label
            htmlFor={key}
            className="block text-xs font-semibold text-[var(--field)]"
          >
            {label}
          </label>
          <VendlSectionField
            fieldKey={key}
            field={field}
            value={props[key]}
            onChange={(value) => updateProp(key, value)}
          />
        </div>
      ))}
    </div>
  );
}
