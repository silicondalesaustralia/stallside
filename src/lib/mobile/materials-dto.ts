import type { MaterialDetailResponse, MaterialsResponse, MobileMaterial } from "@/contracts/mobile/materials";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ingredientCostPerBase } from "@/lib/production/batch-costing";
import { formatUnitCost } from "@/lib/production/format";
import { isLowMaterial, loadCostContext, type MaterialRow } from "@/lib/production/load-cost-context";
import { formatQuantity } from "@/lib/production/unit-convert";
import { loadStandLocale } from "./stand-locale";

type Stand = { id: string; timezone: string };

const day = (date: Date) => date.toISOString().slice(0, 10);

function status(m: MaterialRow): MobileMaterial["status"] {
  if (!m.isActive) return "archived";
  if (m.onHand <= 0) return "out";
  if (isLowMaterial(m)) return "reorder";
  return "in_stock";
}

function toMobileMaterial(m: MaterialRow, currency: string): MobileMaterial {
  return {
    id: m.id,
    name: m.name,
    kind: m.kind,
    baseUnit: m.baseUnit,
    status: status(m),
    onHandLabel: formatQuantity(m.onHand, m.baseUnit),
    costLabel: formatUnitCost(ingredientCostPerBase(m), m.baseUnit, currency),
    supplier: m.supplier,
    sku: m.sku,
  };
}

/** Every material, as on the web Materials page. */
export async function loadMaterialsResponse(ownerId: string, stand: Stand): Promise<MaterialsResponse> {
  const [{ materials }, locale] = await Promise.all([loadCostContext(ownerId), loadStandLocale(stand)]);
  return { ...locale, materials: materials.map((m) => toMobileMaterial(m, locale.currency)) };
}

/** Active materials an invoice line can be matched to. */
export function loadScanMaterials(ownerId: string) {
  return prisma.ingredient.findMany({
    where: { ownerId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, baseUnit: true },
  });
}

/** One material with its purchase history and the recipes that use it; null when it isn't the owner's. */
export async function loadMaterialDetail(
  ownerId: string,
  stand: Stand,
  ingredientId: string,
): Promise<MaterialDetailResponse | null> {
  const [ctx, locale] = await Promise.all([loadCostContext(ownerId), loadStandLocale(stand)]);
  const material = ctx.materials.find((m) => m.id === ingredientId);
  if (!material) return null;
  const purchases = await prisma.ingredientPurchase.findMany({
    where: { ingredientId },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });
  return {
    ...locale,
    material: {
      ...toMobileMaterial(material, locale.currency),
      reorderLabel: material.reorderLevel == null ? null : formatQuantity(material.reorderLevel, material.baseUnit),
      packLabel: `${formatQuantity(material.purchaseQuantity, material.purchaseUnit)} for ${formatMoney(material.purchasePriceCents, locale.currency)}`,
      notes: material.notes,
    },
    purchases: purchases.map((p) => ({
      id: p.id,
      receivedOn: day(p.receivedAt),
      quantityLabel: formatQuantity(Number(p.quantity), p.unit),
      totalCents: p.totalCents,
      supplier: p.supplier,
      lotCode: p.lotCode,
      expiresOn: p.expiresAt ? day(p.expiresAt) : null,
      invoiceNumber: p.invoiceNumber,
      receiptUrl: p.receiptUrl,
    })),
    usedIn: ctx.recipeRows
      .filter((r) => r.lines.some((l) => l.ingredientId === ingredientId))
      .map((r) => ({ id: r.id, name: r.name })),
  };
}
