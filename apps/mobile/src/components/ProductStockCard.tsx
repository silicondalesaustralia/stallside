import { Alert, StyleSheet, Text, View } from "react-native";
import type { MobileProductDetail } from "@contracts/mobile/product-detail";
import { useSetStock } from "@/data/useProducts";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import StockStepper from "@/components/StockStepper";

function stockNote(product: MobileProductDetail): string {
  if (product.stockQuantity <= 0) return "Sold out";
  if (product.stockQuantity <= product.lowStockThreshold) return `Low stock (alert at ${product.lowStockThreshold})`;
  return `In stock · alert at ${product.lowStockThreshold}`;
}

export default function ProductStockCard({ product }: { product: MobileProductDetail }) {
  const setStock = useSetStock();
  const warn = product.stockQuantity <= product.lowStockThreshold;

  return (
    <Card title={product.isPreOrder ? "Pre-order spots" : "Stock"}>
      <View style={styles.line}>
        <Text style={[styles.note, warn && styles.warn]}>{stockNote(product)}</Text>
        <StockStepper
          key={product.stockQuantity}
          value={product.stockQuantity}
          saving={setStock.isPending}
          onSave={(quantity) =>
            setStock.mutate(
              { productId: product.id, quantity },
              { onError: (error) => Alert.alert("Couldn't save stock", error.message) },
            )
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  note: { color: colors.muted, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  warn: { color: colors.danger },
});
