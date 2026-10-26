import { prisma } from "@/lib/prisma";
import type { ExportTax } from "@/lib/order-export/csv";
import { loadExportOrders } from "@/lib/order-export/load-export-orders";
import { ordersToCsv } from "@/lib/order-export/order-csv";
import { orderLinesToCsv } from "@/lib/order-export/line-csv";
import { taxConfig, taxLabel } from "@/lib/tax/config";
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

async function exportTax(ctx: DataContext): Promise<ExportTax> {
  const owner = await prisma.owner.findUnique({
    where: { id: ctx.ownerId },
    select: { gstRegistered: true, taxCountry: true, taxRateBps: true },
  });
  if (!owner) return { name: "Tax", inclusive: true };
  const config = taxConfig(owner, ctx.stand.currency);
  return { name: taxLabel(config), inclusive: config.inclusive };
}

/** Every order for the business, all statuses, so the Payment status column tells them apart. */
export async function exportOrders(ctx: DataContext): Promise<string> {
  const [orders, tax] = await Promise.all([allOrders(ctx), exportTax(ctx)]);
  return ordersToCsv(orders, ctx.stand.timeZone, tax);
}

export async function exportOrderItems(ctx: DataContext): Promise<string> {
  const [orders, tax] = await Promise.all([allOrders(ctx), exportTax(ctx)]);
  return orderLinesToCsv(orders, ctx.stand.timeZone, tax);
}
