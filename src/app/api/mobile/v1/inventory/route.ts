import { inventoryQuery, type InventoryResponse } from "@/contracts/mobile/inventory";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadInventoryReport } from "@/lib/inventory/load-inventory-report";
import { toInventoryResponse } from "@/lib/mobile/inventory-dto";
import { variantCountsFor } from "@/lib/product-variants/variant-counts";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Same stock report as the web Inventory page. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, inventoryQuery);
  if (!query.ok) return query.response;

  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const rows = await loadInventoryReport({
      ownerId: owner.id,
      standId: stand.value.id,
      q: query.data.q,
    });
    const variants = await variantCountsFor(rows.map((row) => row.id));
    return mobileJson<InventoryResponse>(toInventoryResponse(rows, variants));
  } catch (error) {
    return mobileServerError("Mobile inventory failed", error);
  }
}
