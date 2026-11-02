import { TRACKING_FIELD_BY_KEY } from "@/lib/website/tracking/fields";
import type { TagItem } from "@/lib/website/tracking/catalog";
import type { TrackingIdKey, TrackingIds } from "@/lib/website/tracking/types";
import { tagsInputClass } from "./tags-styles";

export default function TagIdFields({
  item,
  ids,
  values,
  errors,
}: {
  item: TagItem;
  ids: TrackingIds;
  values: Record<string, string>;
  errors: Partial<Record<TrackingIdKey, string>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">
        Paste the ID, or the whole snippet from the platform and Vendl will find the ID.
      </p>
      {item.keys.map((key) => {
        const field = TRACKING_FIELD_BY_KEY.get(key);
        if (!field) return null;
        const error = errors[key];
        return (
          <label key={key} className="block text-sm">
            <span className="font-medium">{field.label}</span>
            <input
              name={key}
              defaultValue={values[key] ?? ids[key] ?? ""}
              placeholder={field.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              className={`${tagsInputClass} ${error ? "border-[var(--gone)]" : ""}`}
            />
            <span className={`mt-1 block text-xs ${error ? "text-[var(--gone)]" : "text-[var(--muted)]"}`}>
              {error ?? field.help}
            </span>
          </label>
        );
      })}
    </div>
  );
}
