import { loadExportOrders } from "@/lib/order-export/load-export-orders";
import { ordersToCsv } from "@/lib/order-export/order-csv";
import { orderLinesToCsv } from "@/lib/order-export/line-csv";
import type { DataContext } from "../context";

async function allOrders(ctx: DataContext) {
  return loadExportOrders({
    ownerId: ctx.ownerId,
    standId: ctx.stand.id,
    start: new Date(0),
    end: new Date(),
    includeAllStatuses: true,
  });
}

/** Every order for the business, all statuses, so the Payment status column tells them apart. */
export async function exportOrders(ctx: DataContext): Promise<string> {
  return ordersToCsv(await allOrders(ctx), ctx.stand.timeZone);
}

export async function exportOrderItems(ctx: DataContext): Promise<string> {
  return orderLinesToCsv(await allOrders(ctx), ctx.stand.timeZone);
}
