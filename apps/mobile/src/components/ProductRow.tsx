import { StyleSheet, Text, View } from "react-native";
import type { MobileProduct } from "@contracts/mobile/products";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import StockStepper from "@/components/StockStepper";

type Props = {
  product: MobileProduct;
  saving: boolean;
  onSaveStock: (productId: string, quantity: number) => void;
};

function stockNote(product: MobileProduct): { text: string; warn: boolean } {
  if (product.stockQuantity <= 0) return { text: "Sold out", warn: true };
  if (product.stockQuantity <= product.lowStockThreshold) return { text: "Low stock", warn: true };
  return { text: "In stock", warn: false };
}

export default function ProductRow({ product, saving, onSaveStock }: Props) {
  const note = stockNote(product);
  const meta = [
    formatCents(product.priceCents, product.currency),
    product.sku ? `SKU ${product.sku}` : null,
    product.supplierName ? `Supplier: ${product.supplierName}` : null,
    product.isArchived ? "Draft" : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>{meta.join(" · ")}</Text>
      <View style={styles.stockLine}>
        <Text style={[styles.note, note.warn && styles.warn]}>{note.text}</Text>
        <StockStepper
          key={product.stockQuantity}
          value={product.stockQuantity}
          saving={saving}
          onSave={(quantity) => onSaveStock(product.id, quantity)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  stockLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  note: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  warn: { color: colors.danger },
});
