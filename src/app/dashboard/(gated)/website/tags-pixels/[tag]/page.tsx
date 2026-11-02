import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import { requireOwner } from "@/lib/session";
import { tagItemBySlug, tagItemStatus } from "@/lib/website/tracking/catalog";
import { ownerCanUseTagsPixels } from "@/lib/website/tracking/entitlements";
import { trackingSecretsStatus } from "@/lib/website/tracking/secrets";
import MakeLiveButton from "../MakeLiveButton";
import ServerConversionsForm from "../ServerConversionsForm";
import ServerTestButton from "../ServerTestButton";
import TagItemForm from "../TagItemForm";
import { loadTagsPageData, tagStatusPill } from "../tags-data";
import { TAGS_PATH } from "../tags-state";

const PROVIDER_LABELS = { meta: "Meta", tiktok: "TikTok", ga4: "GA4" } as const;

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  const { tag } = await params;
  const item = tagItemBySlug(tag);
  if (!item) notFound();
  const { owner } = await requireOwner();
  if (!(await ownerCanUseTagsPixels(owner.id))) redirect(TAGS_PATH);
  const sp = await searchParams;
  const { storefront, draft, live, sitePublished, inSync } = await loadTagsPageData(owner);
  const status = tagStatusPill(tagItemStatus(item, draft, live), sitePublished);

  return (
    <main className="flex max-w-3xl flex-col gap-5">
      <PageHeader
        title={item.label}
        subtitle={item.summary}
        backHref={TAGS_PATH}
        backLabel="Tags & Pixels"
        badges={<StatusPill {...status} />}
        actions={<MakeLiveButton slug={item.slug} disabled={!sitePublished || inSync} />}
      />
      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Your tags are live.</p> : null}
      <WebsiteFormError error={sp.error} fallback="Something went wrong. Please try again." />

      <TagItemForm item={item} draft={draft} />

      {item.server ? (
        <>
          <ServerConversionsForm provider={item.server} status={trackingSecretsStatus(storefront.trackingSecrets)} />
          <ServerTestButton provider={item.server} label={PROVIDER_LABELS[item.server]} />
        </>
      ) : null}

      {item.checkUrl ? (
        <p className="text-sm text-[var(--muted)]">
          Once it&apos;s live, confirm it on{" "}
          <a href={item.checkUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--field)] underline">
            {new URL(item.checkUrl).hostname.replace(/^www\./, "")}
          </a>
          .
        </p>
      ) : null}
    </main>
  );
}
