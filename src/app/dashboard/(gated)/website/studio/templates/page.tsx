import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractWebsiteStudio, defaultTemplateId } from "@/lib/studio/storage";
import { STUDIO_TEMPLATE_LIST } from "@/lib/studio/templates";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { applyWebsiteStudioTemplate } from "../actions";

export default async function WebsiteStudioTemplatesPage() {
  const { owner } = await requireOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const studio = extractWebsiteStudio(storefront.draftConfig);
  const current = defaultTemplateId(studio ?? null, normalizeBusinessMode(owner.businessMode));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm">
          <Link href="/dashboard/website/studio" className="font-semibold text-[var(--leaf-dark)] underline">
            ← Back to editor
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Choose a template
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Each template is a complete design direction — typography, spacing, and default homepage layout.
          Your products and menus stay connected automatically.
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STUDIO_TEMPLATE_LIST.map((tpl) => (
          <li
            key={tpl.id}
            className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm ${
              current === tpl.id ? "border-[var(--leaf-dark)] ring-2 ring-[var(--leaf-dark)]/20" : "border-[var(--line)]"
            }`}
          >
            <div
              className={`${tpl.cssClass} flex min-h-[10rem] flex-col justify-end p-5`}
              style={tpl.style}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{tpl.tagline}</p>
              <p className="text-sm text-[var(--muted)]">{tpl.selectorSubtitle}</p>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
                {tpl.label}
              </h2>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <p className="text-sm text-[var(--muted)]">{tpl.description}</p>
              <p className="text-xs text-[var(--muted)]">{tpl.audience}</p>
              <form action={applyWebsiteStudioTemplate.bind(null, tpl.id)} className="mt-auto">
                <button
                  type="submit"
                  className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold ${
                    current === tpl.id
                      ? "border border-[var(--line)] bg-[var(--wash)] text-[var(--field)]"
                      : "bg-[var(--field)] text-white"
                  }`}
                >
                  {current === tpl.id ? "Current template" : `Use ${tpl.label}`}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
