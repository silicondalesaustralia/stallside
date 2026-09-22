import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function CommunicationDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const { owner } = await requireOwner();
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: owner.id },
    include: {
      recipients: {
        orderBy: { createdAt: "asc" },
        take: 100,
        select: { email: true, status: true, errorMessage: true },
      },
    },
  });
  if (!campaign) notFound();

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/communication" className="underline">
            Communication
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {campaign.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {campaign.status} · {campaign.sentCount} sent · {campaign.failedCount}{" "}
          failed · {campaign.recipientCount} recipients ·{" "}
          {campaign.audienceType.replaceAll("_", " ")}
        </p>
      </div>
      <section className="dash-card p-4 text-sm">
        <p className="font-semibold">{campaign.subject}</p>
        {campaign.heading ? (
          <p className="mt-2 font-medium">{campaign.heading}</p>
        ) : null}
        <p className="mt-3 whitespace-pre-wrap text-[var(--muted)]">
          {campaign.body}
        </p>
      </section>
      {campaign.status === "SENDING" ? (
        <p className="text-sm text-[var(--muted)]">
          Sending in the background. Refresh in a minute.
        </p>
      ) : null}
      <section>
        <h2 className="font-semibold">Recipients</h2>
        <ul className="mt-2 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
          {campaign.recipients.map((r) => (
            <li key={r.email} className="flex justify-between gap-2 py-2">
              <span>{r.email}</span>
              <span className="text-[var(--muted)]">
                {r.status}
                {r.errorMessage ? ` · ${r.errorMessage}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
