"use client";

import { useCallback } from "react";
import type { Field } from "@puckeditor/core";
import { usePuck } from "@puckeditor/core";

const INPUT_CLASS =
  "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--field)]";

export function useSectionPropUpdater() {
  const { selectedItem, dispatch, getSelectorForId } = usePuck();

  return useCallback(
    (propKey: string, value: unknown) => {
      if (!selectedItem?.props?.id) return;
      const selector = getSelectorForId(selectedItem.props.id);
      if (!selector) return;

      dispatch({
        type: "replace",
        data: {
          ...selectedItem,
          props: { ...selectedItem.props, [propKey]: value },
        },
        destinationIndex: selector.index,
        destinationZone: selector.zone,
      });
    },
    [selectedItem, dispatch, getSelectorForId],
  );
}

export default function VendlSectionField({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <input
          id={fieldKey}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_CLASS}
        />
      );
    case "textarea":
      return (
        <textarea
          id={fieldKey}
          rows={4}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_CLASS}
        />
      );
    case "number":
      return (
        <input
          id={fieldKey}
          type="number"
          min={field.min}
          max={field.max}
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className={INPUT_CLASS}
        />
      );
    case "select":
      return (
        <select
          id={fieldKey}
          value={String(value ?? "")}
          onChange={(e) => {
            const option = field.options.find((o) => String(o.value) === e.target.value);
            onChange(option?.value ?? e.target.value);
          }}
          className={INPUT_CLASS}
        >
          {field.options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="flex flex-wrap gap-3">
          {field.options.map((option) => (
            <label
              key={String(option.value)}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name={fieldKey}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="size-4 border-[var(--line)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    case "custom":
      return field.render({
        field,
        name: fieldKey,
        id: fieldKey,
        value,
        onChange,
      });
    default:
      return (
        <p className="text-xs text-[var(--muted)]">
          This setting is not editable here yet.
        </p>
      );
  }
}
