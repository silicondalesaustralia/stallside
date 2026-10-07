import type { NextRequest } from "next/server";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  filterInventoryRows,
  loadInventoryReport,
} from "@/lib/inventory/load-inventory-report";
import { inventoryRowsToCsv } from "@/lib/inventory/inventory-csv";

export async function GET(request: NextRequest) {
  const { owner } = await requireOwner();
  try {
    const { selected } = await resolveSelectedBusiness(owner.id);
    const params = request.nextUrl.searchParams;
    const rows = await loadInventoryReport({
      ownerId: owner.id,
      standId: params.get("scope") === "all" ? null : (selected?.id ?? null),
      q: params.get("q") ?? undefined,
    });
    const csv = inventoryRowsToCsv(
      filterInventoryRows(rows, params.get("status") ?? undefined),
    );
    const date = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inventory-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Inventory CSV export failed", error);
    return new Response("Could not export inventory.", { status: 500 });
  }
}
