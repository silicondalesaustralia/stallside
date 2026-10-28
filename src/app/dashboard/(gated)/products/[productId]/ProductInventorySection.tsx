import DashFormSection from "@/components/DashFormSection";
import InventoryAdjustForm from "./InventoryAdjustForm";
import SupplyStatusSelect from "./SupplyStatusSelect";
import type { ProductFields } from "./product-edit-fields";

/** Stock on hand (changes apply straight away), inventory status and the low-stock alert level. */
export default function ProductInventorySection({ product }: { product: ProductFields }) {
  const low = product.stockQuantity <= product.lowStockThreshold;
  return (
    <DashFormSection title="Inventory">
      <p className="font-receipt text-3xl font-semibold tabular-nums">
        {product.stockQuantity}
        <span className={`ml-2 font-sans text-sm font-medium ${low ? "text-[var(--gone)]" : "text-[var(--muted)]"}`}>
          {low ? "in stock - running low" : "in stock"}
        </span>
      </p>
      {product.hasVariants ? (
        <p className="text-sm text-[var(--muted)]">Total across variants. Change stock per variant in Variants below.</p>
      ) : (
        <InventoryAdjustForm productId={product.id} />
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Low-stock alert at</span>
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          defaultValue={product.lowStockThreshold}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <span className="text-xs text-[var(--muted)]">We email you when stock drops to this number.</span>
      </label>
      <SupplyStatusSelect productId={product.id} value={product.supplyStatus} />
    </DashFormSection>
  );
}
