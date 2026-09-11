import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { canUseAiWebsiteBuilder, aiWebsiteBuilderEnabled } from "@/lib/website-ai/config";
import { buildWebsiteBusinessContext } from "@/lib/website-ai/business-context";
import { assessWebsiteContext } from "@/lib/website-ai/assess-context";
import AiBuilderForm from "@/components/website-ai/AiBuilderForm";
import WebStudioSteps from "@/components/website/WebStudioSteps";
import { publishAiWebsiteDraft } from "./actions";

export default async function AiWebsiteBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  if (!aiWebsiteBuilderEnabled()) {
    return (
      <main className="flex max-w-2xl flex-col gap-4 pb-8">
        <WebStudioSteps />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This beta path is turned off in this environment.
        </p>
        <Link href="/dashboard/website/studio" className="text-sm underline">
          Open Edit layout
        </Link>
      </main>
    );
  }

  if (!canUseAiWebsiteBuilder(owner.id)) {
    return (
      <main className="flex max-w-2xl flex-col gap-4 pb-8">
        <WebStudioSteps />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="text-sm text-[var(--muted)]">
          You&apos;re in the classic Studio cohort for this A/B test.
        </p>
        <Link href="/dashboard/website/studio" className="text-sm underline">
          Open Edit layout
        </Link>
      </main>
    );
  }

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) throw new Error("Storefront context unavailable");

  const businessContext = await buildWebsiteBusinessContext(ctx);
  const assessment = assessWebsiteContext(businessContext);
  const studio = extractWebsiteStudio(storefront.draftConfig);
  const previewPath = `${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;

  return (
    <main className="flex max-w-2xl flex-col gap-6 pb-8">
      <WebStudioSteps />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          AI builder
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We already know your business. Tell us what matters most — or let Vendl decide.
        </p>
      </div>

      {params.published === "1" ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Website published.
        </p>
      ) : null}

      {studio ? (
        <div className="rounded-md border border-[var(--border)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--field)]">Draft already exists</p>
          <p className="mt-1 text-[var(--muted)]">
            Generating again will replace the homepage draft (not the live site until you
            publish). Template: {studio.templateId}.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href={previewPath}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--field)] underline"
            >
              Preview website
            </a>
            <Link href="/dashboard/website/studio" className="underline text-[var(--muted)]">
              Edit layout
            </Link>
            <form action={publishAiWebsiteDraft}>
              <button type="submit" className="underline text-[var(--muted)]">
                Publish draft
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <AiBuilderForm assessment={assessment} previewPath={previewPath} />
    </main>
  );
}
