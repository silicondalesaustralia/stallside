import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { setRequestStatus } from "../../actions";
import ConvertRequestForm from "./ConvertRequestForm";

export default async function CustomOrderRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ converted?: string }>;
}) {
  const { owner } = await requireOwner();
  const { requestId } = await params;
  const { converted } = await searchParams;
  const { selected } = await resolveSelectedBusiness(owner.id);

  const req = await prisma.customOrderRequest.findFirst({
    where: { id: requestId, ownerId: owner.id },
    include: {
      form: { select: { id: true, title: true } },
      convertedOrder: { select: { id: true, orderNumber: true } },
    },
  });
  if (!req) notFound();

  const products = selected
    ? await prisma.product.findMany({
        where: {
          ownerId: owner.id,
          standId: selected.id,
          isArchived: false,
          isHidden: false,
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, stockQuantity: true },
        take: 100,
      })
    : [];

  const answers =
    req.answers && typeof req.answers === "object" && !Array.isArray(req.answers)
      ? (req.answers as Record<string, unknown>)
      : {};

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href={`/dashboard/forms/${req.form.id}`} className="underline">
            {req.form.title}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Request</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Status: {req.status}</p>
      </div>

      {converted || req.convertedOrder ? (
        <p className="dash-card border-[var(--leaf)] p-3 text-sm">
          Converted to order{" "}
          <strong>{req.convertedOrder?.orderNumber ?? converted}</strong>. Pack
          from{" "}
          <Link href="/dashboard/fulfilment/orders" className="underline">
            Orders to pack
          </Link>
          .
        </p>
      ) : null}

      <dl className="dash-card space-y-2 p-4 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Name</dt>
          <dd>{req.customerName || "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Email</dt>
          <dd>{req.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Phone</dt>
          <dd>{req.phone || "—"}</dd>
        </div>
        {Object.entries(answers).map(([k, v]) => (
          <div key={k}>
            <dt className="text-[var(--muted)]">{k}</dt>
            <dd>{String(v ?? "")}</dd>
          </div>
        ))}
      </dl>

      <form action={setRequestStatus} className="dash-card flex flex-col gap-3 p-4">
        <input type="hidden" name="id" value={req.id} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Seller notes</span>
          <textarea
            name="sellerNotes"
            rows={2}
            defaultValue={req.sellerNotes ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" name="status" value="ACCEPTED" className={dashCtaClass}>
            Accept
          </button>
          <button
            type="submit"
            name="status"
            value="DECLINED"
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm"
          >
            Decline
          </button>
          <button
            type="submit"
            name="status"
            value="REVIEWING"
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm"
          >
            Mark reviewing
          </button>
        </div>
      </form>

      {req.status === "ACCEPTED" && selected && products.length > 0 ? (
        <ConvertRequestForm
          requestId={req.id}
          standId={selected.id}
          products={products}
        />
      ) : null}
    </main>
  );
}
