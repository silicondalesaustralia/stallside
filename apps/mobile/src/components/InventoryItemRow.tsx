import { Pressable, StyleSheet, Text, View } from "react-native";
import type { InventoryRow } from "@contracts/mobile/inventory";
import { openProduct } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import StockStepper from "@/components/StockStepper";

const STATUS_LABEL: Record<InventoryRow["stockStatus"], string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

type Props = {
  row: InventoryRow;
  saving: boolean;
  onSaveStock: (productId: string, quantity: number) => void;
};

function coverText(row: InventoryRow): string | null {
  if (row.daysCover == null) return null;
  const days = Math.floor(row.daysCover);
  return days < 1 ? "runs out today" : `~${days} day${days === 1 ? "" : "s"} left`;
}

export default function InventoryItemRow({ row, saving, onSaveStock }: Props) {
  const facts = [
    `${row.sold30} sold in 30 days`,
    coverText(row),
    row.incoming > 0 ? `${row.incoming} incoming` : null,
    row.supplyStatusLabel,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => openProduct(row.id)} style={styles.nameButton}>
          {({ pressed }) => <Text style={[styles.name, pressed && styles.pressed]}>{row.name}</Text>}
        </Pressable>
        <Text style={[styles.status, row.stockStatus !== "in_stock" && styles.warn]}>
          {STATUS_LABEL[row.stockStatus]}
        </Text>
      </View>
      {row.sku ? <Text style={styles.meta}>SKU {row.sku}</Text> : null}
      <Text style={styles.meta}>{facts.join(" · ")}</Text>
      <View style={styles.stepper}>
        <StockStepper
          key={row.stockQuantity}
          value={row.stockQuantity}
          saving={saving}
          onSave={(quantity) => onSaveStock(row.id, quantity)}
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
  header: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  nameButton: { flexShrink: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: "600", textDecorationLine: "underline" },
  pressed: { opacity: 0.6 },
  status: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  warn: { color: colors.danger },
  meta: { color: colors.muted, fontSize: 13 },
  stepper: { alignItems: "flex-end", marginTop: spacing.xs },
});
