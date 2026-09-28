import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { prisma } from "@/lib/prisma";
import { inventoryTemplateCsv } from "@/lib/inventory/inventory-csv";

export async function GET() {
  const { owner } = await requireOwner();
  try {
    const { selected } = await resolveSelectedBusiness(owner.id);
    if (!selected) return new Response("No business selected.", { status: 400 });
    const products = await prisma.product.findMany({
      where: { ownerId: owner.id, standId: selected.id, isArchived: false, isPreOrder: false },
      select: { id: true, name: true, sku: true, stockQuantity: true },
      orderBy: { name: "asc" },
    });
    return new Response(inventoryTemplateCsv(products), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="stock-import-template.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Inventory import template failed", error);
    return new Response("Could not create the template.", { status: 500 });
  }
}
