import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  listOwnerCampaigns,
  listOwnerStandingLists,
} from "@/lib/communication/load";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import CampaignsTable from "./CampaignsTable";
import StandingListsTable from "./StandingListsTable";
import CommunicationTabs, { communicationTabFrom } from "./CommunicationTabs";
import SmsComingSoon from "./SmsComingSoon";

export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { owner } = await requireOwner();
  const tab = communicationTabFrom((await searchParams).tab);
  const [campaigns, standingLists] = await Promise.all([
    listOwnerCampaigns(owner.id),
    listOwnerStandingLists(owner.id),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Communication"
        subtitle="Message opted-in contacts, saved lists, product buyers, or one customer."
        actions={
          tab === "email" ? (
            <DashPrimaryCta href="/dashboard/communication/new">+ New message</DashPrimaryCta>
          ) : undefined
        }
      />

      <CommunicationTabs active={tab} />

      {tab === "sms" ? <SmsComingSoon /> : null}

      {tab === "email" && standingLists.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold">Standing lists</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Auto-updating groups — broadcast when you restock or have news.
            </p>
          </div>
          <StandingListsTable lists={standingLists} />
        </section>
      ) : null}

      {tab === "email" ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Email messages</h2>
          {campaigns.length === 0 ? (
            <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
              No messages yet.{" "}
              <Link href="/dashboard/communication/new" className="underline">
                Compose one
              </Link>
              .
            </div>
          ) : (
            <CampaignsTable
              campaigns={campaigns}
              footer={`${campaigns.length} message${campaigns.length === 1 ? "" : "s"}`}
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
