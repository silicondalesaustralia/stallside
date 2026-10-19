import { ordersQuery, type OrdersResponse } from "@/contracts/mobile/orders";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { listStandOrders } from "@/lib/orders/service";
import { toMobileOrderSummary } from "@/lib/mobile/order-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, ordersQuery);
  if (!query.ok) return query.response;

  const stand = await requireMobileStand(guard.value.owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const page = await listStandOrders({
      ownerId: guard.value.owner.id,
      standId: stand.value.id,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
    return mobileJson<OrdersResponse>({
      orders: page.orders.map(toMobileOrderSummary),
      nextCursor: page.nextCursor,
    });
  } catch (error) {
    return mobileServerError("Mobile orders list failed", error);
  }
}
