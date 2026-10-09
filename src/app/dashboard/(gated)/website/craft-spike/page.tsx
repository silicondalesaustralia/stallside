import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { extractCraftSpike } from "@/lib/craft/storage";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import CraftSpikeEditor from "@/components/craft/CraftSpikeEditor";

export default async function CraftSpikePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) throw new Error("Storefront context unavailable");

  const craftSpike = extractCraftSpike(storefront.draftConfig);
  const metadata = await buildPuckSpikeMetadata(ctx, true);
  const base = appBaseUrl();
  const previewUrl = `${base}${storefrontPublicPath(storefront.slug)}/craft-preview?draft=1`;

  const showNextDrop =
    ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH";

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Website (Craft.js spike)
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Experimental editor — compare with the Puck spike. Live site unchanged until publish.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          <a href="/dashboard/website/puck-spike" className="underline">
            Open Puck spike
          </a>
        </p>
      </div>
      <CraftSpikeEditor
        initialNodes={craftSpike?.nodes ?? null}
        metadata={metadata}
        previewUrl={previewUrl}
        isPublished={storefront.isPublished}
        starter={{
          headline: storefront.headline ?? owner.businessName,
          subheadline: storefront.subheadline,
          about: storefront.about,
          showNextDrop,
        }}
        saved={params.saved === "1"}
        published={params.published === "1"}
        error={params.error}
      />
    </main>
  );
}
