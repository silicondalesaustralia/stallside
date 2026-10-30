import { purchaseBody, type MaterialsMessage } from "@/contracts/mobile/materials";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { recordOwnerPurchase } from "@/lib/production/purchases";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

const day = (value: string | null) => (value ? new Date(`${value}T12:00:00Z`) : null);

/** Incoming supplies, same as "Record purchase" on the web: adds stock and sets the current price. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, purchaseBody);
  if (!body.ok) return body.response;
  try {
    const { expiresOn, receivedOn, supplier, lotCode, notes, ...rest } = body.data;
    const result = await recordOwnerPurchase(guard.value.owner.id, {
      ...rest,
      supplier: supplier || null,
      lotCode: lotCode || null,
      notes: notes || null,
      expiresAt: day(expiresOn),
      receivedAt: day(receivedOn),
    });
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<MaterialsMessage>({ message: result.message ?? "Purchase recorded." });
  } catch (error) {
    return mobileServerError("Mobile record purchase failed", error);
  }
}
