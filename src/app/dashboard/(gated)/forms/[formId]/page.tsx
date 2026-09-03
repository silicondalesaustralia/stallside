import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { updateCustomOrderForm } from "../actions";

export default async function CustomOrderFormDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { owner } = await requireOwner();
  const { formId } = await params;
  const form = await prisma.customOrderForm.findFirst({
    where: { id: formId, ownerId: owner.id },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      requests: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          status: true,
          customerName: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });
  if (!form) notFound();

  const publicUrl = `${appBaseUrl()}/f/${form.id}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/forms" className="underline">
            Custom orders
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {form.title}
        </h1>
        <p className="mt-1 break-all text-sm text-[var(--muted)]">
          Public link:{" "}
          <a href={publicUrl} className="underline">
            {publicUrl}
          </a>
        </p>
      </div>

      <form action={updateCustomOrderForm} className="dash-card flex flex-col gap-4 p-5">
        <input type="hidden" name="id" value={form.id} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Title</span>
          <input
            name="title"
            defaultValue={form.title}
            required
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={form.description ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Thank-you note</span>
          <textarea
            name="thankYouNote"
            rows={2}
            defaultValue={form.thankYouNote ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={form.isPublished}
          />
          Published (public form accepts submissions)
        </label>
        <p className="text-sm text-[var(--muted)]">
          Fields:{" "}
          {form.fields.map((f) => f.label).join(", ") || "none"}
        </p>
        <button type="submit" className={dashCtaClass}>
          Save
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold">Requests</h2>
        {form.requests.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {form.requests.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <Link
                  href={`/dashboard/forms/requests/${r.id}`}
                  className="font-medium underline"
                >
                  {r.customerName || r.email || "Request"}
                </Link>
                <span className="text-[var(--muted)]">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
