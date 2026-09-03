import { prisma } from "@/lib/prisma";
import {
  loadOpsBoardOrders,
  loadOpsOrderById,
  type OpsBoardFilter,
  type OpsBoardOrder,
} from "@/lib/ops/board";
import { parseOpsView } from "../ops-display";

export async function loadOrdersForPrint(
  ownerId: string,
  opts: {
    ids?: string | null;
    view?: string | null;
    q?: string | null;
    standId?: string | null;
    handover?: OpsBoardFilter["handover"];
  },
): Promise<OpsBoardOrder[]> {
  const idList = (opts.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (idList.length > 0) {
    const rows: OpsBoardOrder[] = [];
    for (const id of idList.slice(0, 100)) {
      const order = await loadOpsOrderById(ownerId, id);
      if (order) rows.push(order);
    }
    return rows;
  }

  return loadOpsBoardOrders({
    ownerId,
    view: parseOpsView(opts.view ?? undefined),
    q: opts.q?.trim() || null,
    standId: opts.standId?.trim() || null,
    handover: opts.handover ?? null,
  });
}

export async function loadPrintBrand(ownerId: string, standId?: string | null) {
  const stand = standId
    ? await prisma.stand.findFirst({
        where: { id: standId, ownerId },
        select: { name: true, logoUrl: true },
      })
    : await prisma.stand.findFirst({
        where: { ownerId },
        orderBy: { createdAt: "asc" },
        select: { name: true, logoUrl: true },
      });
  return {
    name: stand?.name ?? "Business",
    logoUrl: stand?.logoUrl ?? null,
  };
}
