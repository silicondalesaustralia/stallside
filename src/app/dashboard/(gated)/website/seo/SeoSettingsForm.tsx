"use client";

import type { EntitySeoSettings } from "@/lib/studio/seo-settings";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default function SeoSettingsForm({
  action,
  defaults,
  settings,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults: { title: string; description: string };
  settings: EntitySeoSettings;
}) {
  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Leave fields blank to use defaults: <strong>{defaults.title}</strong>
      </p>

      <label className="block text-sm">
        <span className="font-medium">Search title</span>
        <input
          name="seoTitle"
          defaultValue={settings.seoTitle ?? ""}
          maxLength={120}
          placeholder={defaults.title}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Meta description</span>
        <textarea
          name="seoDescription"
          defaultValue={settings.seoDescription ?? ""}
          maxLength={320}
          rows={3}
          placeholder={defaults.description}
          className={inputClass}
        />
      </label>

      <fieldset className="space-y-4 rounded-xl border border-[var(--line)] p-4">
        <legend className="px-1 text-sm font-semibold text-[var(--field)]">
          Social sharing (Open Graph)
        </legend>
        <label className="block text-sm">
          <span className="font-medium">Social title</span>
          <input name="ogTitle" defaultValue={settings.ogTitle ?? ""} maxLength={120} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Social description</span>
          <textarea
            name="ogDescription"
            defaultValue={settings.ogDescription ?? ""}
            maxLength={320}
            rows={2}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Social image URL</span>
          <input
            name="ogImageUrl"
            type="url"
            defaultValue={settings.ogImageUrl ?? ""}
            placeholder="https://"
            className={inputClass}
          />
        </label>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium">Search engine indexing</span>
        <select name="robots" defaultValue={settings.robots ?? "default"} className={inputClass}>
          <option value="default">Default (index when published)</option>
          <option value="index">Always index</option>
          <option value="noindex">No index</option>
        </select>
      </label>

      <button
        type="submit"
        className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Save SEO settings
      </button>
    </form>
  );
}
