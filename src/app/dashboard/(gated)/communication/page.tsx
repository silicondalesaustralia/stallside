import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function CommunicationPage() {
  const { owner } = await requireOwner();
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Communication
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Email everyone opted in, one customer, or people who bought a
            product.
          </p>
        </div>
        <Link
          href="/dashboard/communication/new"
          className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
        >
          + New message
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No messages yet.{" "}
          <Link href="/dashboard/communication/new" className="underline">
            Compose one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {campaigns.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <Link
                  href={`/dashboard/communication/${c.id}`}
                  className="font-medium underline"
                >
                  {c.name}
                </Link>
                <p className="mt-1 text-[var(--muted)]">
                  {c.status} · {c.sentCount}/{c.recipientCount} sent ·{" "}
                  {c.audienceType.replaceAll("_", " ")}
                </p>
              </div>
              <Link
                href={`/dashboard/communication/${c.id}`}
                className="text-[var(--leaf-dark)] underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
