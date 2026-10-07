import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import {
  listSquareConnections,
  listStripeConnections,
} from "@/lib/admin-payment-connections";
import AdminSquareConnections from "./AdminSquareConnections";
import AdminStripeConnections from "./AdminStripeConnections";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const [square, stripe] = await Promise.all([
    listSquareConnections(),
    listStripeConnections(),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-[var(--muted)] underline">
          ← SaaS overview
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Payment connections
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Sellers who have connected Square or Stripe to Vendl.
        </p>
      </div>
      <AdminSquareConnections rows={square} />
      <AdminStripeConnections rows={stripe} />
    </main>
  );
}
