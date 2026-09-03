import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { parseDraftConfigWithPuck } from "@/lib/puck/spike-storage";
import { buildStarterHome, sanitiseEditorHome } from "@/lib/puck/starter-home";
import { buildDefaultSpikeHome } from "@/lib/puck/spike-defaults";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import PuckSpikeEditor from "./PuckSpikeEditor";
import { resetPuckSpikeDraft } from "./actions";

export default async function PuckSpikePage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    published?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) {
    throw new Error("Storefront context unavailable");
  }

  const configWithPuck = parseDraftConfigWithPuck(storefront.draftConfig);
  const starterHome = buildStarterHome({
    businessMode: ctx.businessMode,
    headline: storefront.headline ?? owner.businessName,
    subheadline: storefront.subheadline,
    about: storefront.about,
  });
  const rawHome =
    configWithPuck.puckSpike?.home ??
    buildDefaultSpikeHome({
      config: configWithPuck,
      headline: storefront.headline ?? owner.businessName,
      subheadline: storefront.subheadline,
      about: storefront.about,
      businessMode: ctx.businessMode,
    }) ??
    starterHome;
  const initialData = sanitiseEditorHome(rawHome, starterHome);

  const metadata = await buildPuckSpikeMetadata(ctx, true);
  const base = appBaseUrl();
  const previewUrl = `${base}${storefrontPublicPath(storefront.slug)}/puck-preview?draft=1`;

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Website
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Click any section to edit it. Your live site stays unchanged until you publish.
        </p>
      </div>
      <PuckSpikeEditor
        initialData={initialData}
        metadata={metadata}
        previewUrl={previewUrl}
        isPublished={storefront.isPublished}
        saved={params.saved === "1"}
        published={params.published === "1"}
        error={params.error}
        onResetDraft={resetPuckSpikeDraft}
      />
    </main>
  );
}
