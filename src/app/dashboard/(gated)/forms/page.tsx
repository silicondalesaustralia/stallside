import Link from "next/link";
import { CustomOrderRequestStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export default async function CustomOrderFormsPage() {
  const { owner } = await requireOwner();
  const forms = await prisma.customOrderForm.findMany({
    where: { ownerId: owner.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          requests: {
            where: {
              status: {
                in: [
                  CustomOrderRequestStatus.SUBMITTED,
                  CustomOrderRequestStatus.REVIEWING,
                ],
              },
            },
          },
        },
      },
    },
  });

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

      {forms.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No forms yet. Create one and share the public link.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
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
    </main>
  );
}
