import DashFormSection from "@/components/DashFormSection";
import InventoryAdjustForm from "./InventoryAdjustForm";

export default function ProductStockCard({
  stockQuantity,
  productId,
}: {
  stockQuantity: number;
  productId: string;
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
    </DashFormSection>
  );
}
