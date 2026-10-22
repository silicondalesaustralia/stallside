import type { NextRequest } from "next/server";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { resolveStandTimezone } from "@/lib/stand-timezone";
import { resolveDateWindow } from "@/lib/date-range";
import { loadExportOrders } from "@/lib/order-export/load-export-orders";
import { ordersToCsv } from "@/lib/order-export/order-csv";
import { orderLinesToCsv } from "@/lib/order-export/line-csv";

export async function GET(request: NextRequest) {
  const { owner } = await requireOwner();
  try {
    const { selected } = await resolveSelectedBusiness(owner.id);
    if (!selected) return new Response("No business selected.", { status: 400 });
    const params = request.nextUrl.searchParams;
    const timeZone = resolveStandTimezone(selected.timezone);
    const window = resolveDateWindow(
      {
        range: params.get("range") ?? undefined,
        from: params.get("from") ?? undefined,
        to: params.get("to") ?? undefined,
      },
      timeZone,
    );
    const orders = await loadExportOrders({
      ownerId: owner.id,
      standId: selected.id,
      start: window.start,
      end: window.end,
      includeAllStatuses: params.get("status") === "all",
    });
    const lines = params.get("kind") === "items";
    const csv = lines
      ? orderLinesToCsv(orders, timeZone)
      : ordersToCsv(orders, timeZone);
    const name = lines ? "order-items" : "orders";
    const filename = `${name}-${window.fromParam}-to-${window.toParam}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Orders CSV export failed", error);
    return new Response("Could not export orders.", { status: 500 });
  }
}
