import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadAdminAffiliates } from "@/lib/affiliate/load-admin-affiliates";
import AdminAffiliateSummary from "./AdminAffiliateSummary";
import AdminAffiliateTable from "./AdminAffiliateTable";
import AdminAffiliatePayouts from "./AdminAffiliatePayouts";

export default async function AdminAffiliatesPage() {
  await requireAdmin();
  const [{ rows, totals }, payouts] = await Promise.all([
    loadAdminAffiliates(),
    prisma.affiliatePayout.findMany({
      orderBy: { paidAt: "desc" },
      take: 25,
      include: { affiliateOwner: { select: { businessName: true } } },
    }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Affiliates</h1>
        <p className="mt-1 text-[var(--muted)]">
          Pro members earn 50% of referred Pro invoices (ex tax) for life. Payouts
          are manual: pay by bank transfer, then mark paid here.
        </p>
      </div>
      <AdminAffiliateSummary totals={totals} />
      <AdminAffiliateTable rows={rows} />
      <AdminAffiliatePayouts payouts={payouts} />
    </main>
  );
}
