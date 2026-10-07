import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";

/** Square can be ticked per business once payments are on; checkout still requires Square as provider. */
export async function ownerSquareReady(owner: {
  id: string;
  billingCurrency: string | null;
}): Promise<boolean> {
  if (!squareEligibleBillingCurrency(owner.billingCurrency)) return false;
  if (!isSquareConnectEnabled()) return false;
  const conn = await getSquareConnection(owner.id);
  return (
    conn?.status === "ACTIVE" &&
    Boolean(conn.paymentsEnabled) &&
    Boolean(conn.primaryLocationId)
  );
}
