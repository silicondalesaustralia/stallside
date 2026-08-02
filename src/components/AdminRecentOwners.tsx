import Link from "next/link";
import AdminLoginAsButton from "@/components/AdminLoginAsButton";
import { formatMoney } from "@/lib/money";

type RecentOwner = {
  id: string;
  businessName: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  lifetimePaidCents: number;
  user: { email: string | null };
  stands: { name: string }[];
};

export default function AdminRecentOwners({
  owners,
  currency,
}: {
  owners: RecentOwner[];
  currency: string;
}) {
  if (owners.length === 0) {
    return <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>;
  }

  return (
    <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
      {owners.map((owner) => (
        <li
          key={owner.id}
          className="flex flex-wrap items-center justify-between gap-2 py-3"
        >
          <div>
            <Link
              href={`/admin/owners/${owner.id}`}
              className="font-medium underline"
            >
              {owner.businessName}
            </Link>
            <p className="text-[var(--muted)]">
              {owner.user.email}
              {owner.stands[0]
                ? ` · ${owner.stands.map((s) => s.name).join(", ")}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[var(--muted)]">
              {owner.subscriptionPlan ?? "-"} ·{" "}
              {owner.subscriptionStatus.toLowerCase()} · LTV{" "}
              {formatMoney(owner.lifetimePaidCents, currency)}
            </p>
            <AdminLoginAsButton ownerId={owner.id} compact />
          </div>
        </li>
      ))}
    </ul>
  );
}
