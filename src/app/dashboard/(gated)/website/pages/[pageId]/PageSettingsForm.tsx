import type { StorefrontCustomPage } from "@/lib/studio/custom-pages";
import { deleteCustomPage, updateCustomPageMeta } from "../actions";

const INPUT = "mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2";

/** Title, menu label, web address and header/footer placement for one page. */
export default function PageSettingsForm({ page }: { page: StorefrontCustomPage }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold text-[var(--field)]">Page settings</h2>
      <form action={updateCustomPageMeta.bind(null, page.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">Title</span>
          <input name="title" defaultValue={page.title} className={INPUT} />
        </label>
        <label className="text-sm">
          <span className="font-medium">Nav label</span>
          <input name="navLabel" defaultValue={page.navLabel} className={INPUT} />
        </label>
        {page.routeKind === "custom" ? (
          <label className="text-sm sm:col-span-2">
            <span className="font-medium">URL slug</span>
            <input name="slug" defaultValue={page.slug} className={INPUT} />
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showInNav" defaultChecked={page.showInNav} />
          Show in header nav
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showInFooter" defaultChecked={page.showInFooter} />
          Show in footer
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
            Save settings
          </button>
        </div>
      </form>
      {page.routeKind === "custom" ? (
        <form action={deleteCustomPage.bind(null, page.id)} className="mt-4">
          <button type="submit" className="text-sm font-semibold text-[var(--gone)]">
            Delete page
          </button>
        </form>
      ) : null}
    </section>
  );
}
