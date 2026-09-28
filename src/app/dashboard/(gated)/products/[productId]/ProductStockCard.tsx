import DashFormSection from "@/components/DashFormSection";
import InventoryAdjustForm from "./InventoryAdjustForm";
import SupplyStatusSelect from "./SupplyStatusSelect";
import type { ProductSupplyStatus } from "@/generated/prisma/client";

export default function ProductStockCard({
  stockQuantity,
  productId,
  supplyStatus,
}: {
  stockQuantity: number;
  productId: string;
  supplyStatus: ProductSupplyStatus | null;
}) {
  return (
    <DashFormSection
      title="Stock"
      hint="Restock, correct counts, or log cash sales made without QR."
    >
      <p className="font-receipt text-3xl font-semibold tabular-nums">
        {stockQuantity}
        <span className="ml-2 text-sm font-sans font-medium text-[var(--muted)]">
          in stock
        </span>
      </p>
      <InventoryAdjustForm productId={productId} />
      <SupplyStatusSelect productId={productId} value={supplyStatus} />
    </DashFormSection>
  );
}
