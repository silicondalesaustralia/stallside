import {
  TRACKING_FIELDS,
  TRACKING_GROUP_LABELS,
  type TrackingFieldGroup as Group,
} from "@/lib/website/tracking/fields";
import type { TrackingIdKey, TrackingIds } from "@/lib/website/tracking/types";
import { tagsCardClass, tagsInputClass } from "./tags-styles";

const GROUP_INTRO: Record<Group, string> = {
  verification: "Prove you own this website. Paste the meta tag or just its code, save, make live, then press Verify on the platform.",
  analytics: "See who visits and what they do.",
  ads: "Measure sales from your ads. Vendl sends page views, product views, add to cart, checkout and purchases automatically.",
};

export default function TrackingFieldGroup({
  group,
  ids,
  values,
  errors,
}: {
  group: Group;
  ids: TrackingIds;
  values: Record<string, string>;
  errors: Partial<Record<TrackingIdKey, string>>;
}) {
  const fields = TRACKING_FIELDS.filter((f) => f.group === group);
  return (
    <section className={tagsCardClass}>
      <h2 className="font-semibold text-[var(--field)]">{TRACKING_GROUP_LABELS[group]}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{GROUP_INTRO[group]}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.key];
          return (
            <label key={field.key} className="block text-sm">
              <span className="flex items-center justify-between gap-2 font-medium">
                {field.label}
                {ids[field.key] ? <span className="text-xs font-semibold text-[var(--ok)]">Saved</span> : null}
              </span>
              <input
                name={field.key}
                defaultValue={values[field.key] ?? ids[field.key] ?? ""}
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
    </section>
  );
}
