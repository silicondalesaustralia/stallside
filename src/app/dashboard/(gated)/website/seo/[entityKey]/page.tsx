import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { entityKeyFromParam, resolveSeoFields } from "@/lib/studio/seo-settings";
import { DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import { saveEntitySeo } from "../actions";
import { resolveEntityContext } from "../resolve-seo-entity";
import SeoSettingsForm from "../SeoSettingsForm";

export default async function WebsiteSeoEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ entityKey: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const { entityKey: entityParam } = await params;
  const sp = await searchParams;
  const entityKey = entityKeyFromParam(entityParam);
  const ctx = await resolveEntityContext(owner.id, owner.businessName, entityKey);
  if (!ctx) notFound();

  const preview = resolveSeoFields(ctx.defaults, ctx.settings);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm">
          <Link href="/dashboard/website/seo" className="font-semibold text-[var(--leaf-dark)] underline">
            ← Search & social
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          {ctx.label}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{ctx.pathLabel}</p>
      </div>

      {sp.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">
          Saved to your draft. Publish your website to make it live.
        </p>
      ) : null}
      {sp.error === "conflict" ? (
        <p className="text-sm font-medium text-red-700">{DRAFT_CONFLICT_MESSAGE}</p>
      ) : null}
      {entityKey.startsWith("product:") ? (
        <p className="text-sm text-[var(--muted)]">
          These settings apply to your website only. The product&apos;s own search title and
          description (used on your stand page) are edited on the product.
        </p>
      ) : null}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p className="font-semibold text-[var(--field)]">Preview</p>
        <p className="mt-2 text-[var(--leaf-dark)]">{preview.title}</p>
        <p className="mt-1 text-[var(--muted)]">{preview.description}</p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <SeoSettingsForm
          action={saveEntitySeo.bind(null, entityParam)}
          defaults={ctx.defaults}
          settings={ctx.settings}
        />
      </section>
    </main>
  );
}
