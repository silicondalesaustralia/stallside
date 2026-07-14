import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export default async function AdminOwnersPage() {
  await requireAdmin();
  const owners = await prisma.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      stands: { select: { id: true, name: true }, take: 4 },
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Subscribers</h1>
        <p className="mt-1 text-[var(--muted)]">
          Business, stalls, plan, LTV, and billing status.
        </p>
      </div>

      {owners.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No owners yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="py-2 pr-3 font-medium">Business / stalls</th>
                <th className="py-2 pr-3 font-medium">Owner ID</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 pr-3 font-medium">LTV</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr
                  key={owner.id}
                  className="border-b border-[var(--line)] align-top"
                >
                  <td className="py-3 pr-3">
                    <Link
                      href={`/admin/owners/${owner.id}`}
                      className="font-medium underline"
                    >
                      {owner.businessName}
                    </Link>
                    <p className="mt-0.5 text-[var(--muted)]">
                      {owner.stands.length === 0
                        ? "No stalls"
                        : owner.stands.map((s) => s.name).join(", ")}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <code className="text-xs">{owner.id}</code>
                  </td>
                  <td className="py-3 pr-3">{owner.user.email}</td>
                  <td className="py-3 pr-3 capitalize">
                    {owner.subscriptionPlan ?? "—"}
                  </td>
                  <td className="py-3 pr-3">
                    {formatMoney(owner.lifetimePaidCents, DEFAULT_CURRENCY)}
                  </td>
                  <td className="py-3 capitalize">
                    {owner.subscriptionStatus.toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
