import type { StorefrontBlogSettings } from "@/lib/studio/blog";
import { updateBlogSettings } from "./actions";

const INPUT = "mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2";

/** Blog on/off, header link and index title; shown on the Blog page under Pages. */
export default function BlogSettingsSection({ settings }: { settings: StorefrontBlogSettings }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold text-[var(--field)]">Blog settings</h2>
      <form action={updateBlogSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="enabled" defaultChecked={settings.enabled} />
          Blog enabled on your website
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="showInNav" defaultChecked={settings.showInNav} />
          Show in header navigation
        </label>
        <label className="text-sm">
          <span className="font-medium">Nav label</span>
          <input name="navLabel" defaultValue={settings.navLabel} className={INPUT} />
        </label>
        <label className="text-sm">
          <span className="font-medium">Index page title</span>
          <input name="indexTitle" defaultValue={settings.indexTitle} className={INPUT} />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
            Save blog settings
          </button>
        </div>
      </form>
    </section>
  );
}
