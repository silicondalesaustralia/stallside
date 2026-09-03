import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { queueCampaign, sendCampaignTest } from "../actions";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ queued?: string; tested?: string }>;
}) {
  const { campaignId } = await params;
  const sp = await searchParams;
  const { owner } = await requireOwner();
  const currency = owner.billingCurrency || "AUD";

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: owner.id },
    include: {
      segment: { select: { name: true } },
      promotion: { select: { code: true } },
    },
  });
  if (!campaign) notFound();

  const canSend =
    campaign.status === "DRAFT" || campaign.status === "FAILED";

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/campaigns" className="underline">
            Campaigns
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {campaign.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {campaign.status}
          {campaign.segment ? ` · ${campaign.segment.name}` : ""}
          {campaign.promotion ? ` · code ${campaign.promotion.code}` : ""}
        </p>
      </div>

      {sp.queued ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Send queued — emails go out in batches.
        </p>
      ) : null}
      {sp.tested ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Test email sent to {owner.contactEmail}.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Recipients" value={String(campaign.recipientCount)} />
        <Metric label="Sent" value={String(campaign.sentCount)} />
        <Metric label="Clicks" value={String(campaign.clickCount)} />
        <Metric label="Orders" value={String(campaign.attributedOrders)} />
        <Metric
          label="Revenue"
          value={formatMoney(campaign.attributedRevenueCents, currency)}
        />
        <Metric label="Failed" value={String(campaign.failedCount)} />
      </section>

      <section className="dash-card flex max-w-xl flex-col gap-3 p-5 text-sm">
        <p>
          <span className="font-medium">Subject:</span> {campaign.subject}
        </p>
        {campaign.heading ? (
          <p>
            <span className="font-medium">Heading:</span> {campaign.heading}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-[var(--muted)]">{campaign.body}</p>
        {campaign.ctaLabel ? (
          <p>
            CTA: {campaign.ctaLabel}
            {campaign.ctaUrl ? ` → ${campaign.ctaUrl}` : ""}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <form action={sendCampaignTest}>
          <input type="hidden" name="id" value={campaign.id} />
          <button type="submit" className="text-sm font-semibold underline">
            Send test to me
          </button>
        </form>
        {canSend ? (
          <form action={queueCampaign}>
            <input type="hidden" name="id" value={campaign.id} />
            <button type="submit" className={dashCtaClass}>
              Send campaign
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
