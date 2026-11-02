import PageHeader from "@/components/dashboard/ui/PageHeader";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import { requireOwner } from "@/lib/session";
import { TAG_GROUP_LABELS, TAG_GROUP_ORDER, TAG_ITEMS } from "@/lib/website/tracking/catalog";
import { ownerCanUseTagsPixels } from "@/lib/website/tracking/entitlements";
import { TAGS_DEBUG_PARAM } from "@/lib/website/tracking/load-live";
import { trackingSecretsStatus } from "@/lib/website/tracking/secrets";
import MakeLiveButton from "./MakeLiveButton";
import TagsProUpgradeCard from "./TagsProUpgradeCard";
import TagsTable from "./TagsTable";
import TagsValidateCard from "./TagsValidateCard";
import { liveStatusText, loadTagsPageData } from "./tags-data";

export default async function WebsiteTagsPixelsPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  if (!(await ownerCanUseTagsPixels(owner.id))) {
    return (
      <main className="flex flex-col gap-5">
        <PageHeader title="Tags & Pixels" />
        <TagsProUpgradeCard />
      </main>
    );
  }
  const { storefront, draft, live, sitePublished, inSync, origin } = await loadTagsPageData(owner);
  const secrets = trackingSecretsStatus(storefront.trackingSecrets);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Tags & Pixels"
        subtitle={`Connect Google, Meta, TikTok and other tools to ${origin.replace("https://", "")}. ${liveStatusText(sitePublished, inSync)}`}
        actions={<MakeLiveButton disabled={!sitePublished || inSync} />}
      />
      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Your tags are live.</p> : null}
      <WebsiteFormError error={sp.error} fallback="Something went wrong. Please try again." />

      {TAG_GROUP_ORDER.map((group) => (
        <TagsTable
          key={group}
          title={TAG_GROUP_LABELS[group]}
          items={TAG_ITEMS.filter((item) => item.group === group)}
          draft={draft}
          live={live}
          sitePublished={sitePublished}
          secrets={secrets}
        />
      ))}

      <TagsValidateCard
        sitePublished={sitePublished}
        inSync={inSync}
        liveIds={live.ids}
        testUrl={`${origin}/?${TAGS_DEBUG_PARAM}=1`}
      />
    </main>
  );
}
