import WebsiteFormError from "@/components/website/WebsiteFormError";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractStorefrontTracking, trackingMatches } from "@/lib/website/tracking/config";
import { ownerCanUseTagsPixels } from "@/lib/website/tracking/entitlements";
import { TAGS_DEBUG_PARAM } from "@/lib/website/tracking/load-live";
import { trackingSecretsStatus } from "@/lib/website/tracking/secrets";
import { liveSiteOrigin } from "@/lib/website/tracking/server/live-origin";
import ServerConversionsForm from "./ServerConversionsForm";
import ServerTestButton from "./ServerTestButton";
import TagsGoLiveCard from "./TagsGoLiveCard";
import TagsProUpgradeCard from "./TagsProUpgradeCard";
import TagsSettingsForm from "./TagsSettingsForm";

export default async function WebsiteTagsPixelsPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  if (!(await ownerCanUseTagsPixels(owner.id))) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">Tags & Pixels</h1>
        <TagsProUpgradeCard />
      </main>
    );
  }
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const draft = extractStorefrontTracking(storefront.draftConfig);
  const live = extractStorefrontTracking(storefront.publishedConfig);
  const sitePublished = storefront.isPublished && storefront.publishedConfig !== null;
  const origin = await liveSiteOrigin(storefront);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">Tags & Pixels</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connect Google, Meta, TikTok, Pinterest and other tools to your website. Paste each ID (or the whole snippet,
          we&apos;ll find the ID), save, then make your tags live. Tags run on {origin.replace("https://", "")}, not on
          vendl.app links or in the editor preview.
        </p>
      </div>

      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Your tags are live.</p> : null}
      <WebsiteFormError error={sp.error} fallback="Something went wrong. Please try again." />

      <TagsGoLiveCard
        sitePublished={sitePublished}
        inSync={trackingMatches(draft, live)}
        liveIds={live.ids}
        testUrl={`${origin}/?${TAGS_DEBUG_PARAM}=1`}
      />
      <TagsSettingsForm draft={draft} />
      <ServerConversionsForm status={trackingSecretsStatus(storefront.trackingSecrets)} />
      <section className="flex flex-wrap gap-4">
        <ServerTestButton provider="meta" label="Meta" />
        <ServerTestButton provider="tiktok" label="TikTok" />
        <ServerTestButton provider="ga4" label="GA4" />
      </section>
    </main>
  );
}
