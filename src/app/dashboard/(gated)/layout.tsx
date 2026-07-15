import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ownerNeedsPayment } from "@/lib/owner-trial";

/** Locks stands/products/inventory/orders/settings until subscription or trial access is valid. */
export default async function GatedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { owner, user } = await requireOwner();
  if (ownerNeedsPayment(owner, { email: user.email, role: user.role })) {
    redirect("/dashboard/settings/billing?locked=1");
  }
  return children;
}
