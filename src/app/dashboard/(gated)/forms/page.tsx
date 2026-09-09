import Link from "next/link";
import { CustomOrderRequestStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export default async function CustomOrderFormsPage() {
  const { owner } = await requireOwner();
  const pendingStatuses = [
    CustomOrderRequestStatus.SUBMITTED,
    CustomOrderRequestStatus.REVIEWING,
  ] as const;

  const [forms, pendingRequests] = await Promise.all([
    prisma.customOrderForm.findMany({
      where: { ownerId: owner.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            requests: {
              where: { status: { in: [...pendingStatuses] } },
            },
          },
        },
      },
    }),
    prisma.customOrderRequest.findMany({
      where: {
        ownerId: owner.id,
        status: { in: [...pendingStatuses] },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        status: true,
        customerName: true,
        email: true,
        createdAt: true,
        form: { select: { title: true } },
      },
    }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/operate" className="underline">
              Operate
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Custom orders
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Request forms for cakes, hampers, and specials.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/forms/new">+ New form</DashPrimaryCta>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Pending requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No open requests yet. Submissions appear here when customers use your
            public form link.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {pendingRequests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/forms/requests/${r.id}`}
                    className="font-medium underline"
                  >
                    {r.customerName || r.email || "Request"}
                  </Link>
                  <p className="mt-0.5 text-[var(--muted)]">
                    {r.form.title} ·{" "}
                    {r.createdAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span className="text-[var(--muted)]">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Forms</h2>
        {forms.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No forms yet. Create one and share the public link.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {forms.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/forms/${f.id}`}
                    className="font-medium underline"
                  >
                    {f.title}
                  </Link>
                  <p className="mt-1 text-[var(--muted)]">
                    {f.isPublished ? "Published" : "Draft"} ·{" "}
                    {f._count.requests} pending
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
