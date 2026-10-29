import { Alert, StyleSheet, Text, View } from "react-native";
import type { MobileProductDetail } from "@contracts/mobile/product-detail";
import { useSetVariantStock } from "@/data/useProduct";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import StockStepper from "@/components/StockStepper";

export default function ProductVariantsCard({
  product,
}: {
  product: MobileProductDetail;
}) {
  const setStock = useSetVariantStock(product.id);
  const savingId = setStock.isPending ? setStock.variables?.variantId : null;

  return (
    <Card title={`Variants · ${product.stockQuantity} in stock`}>
      {product.variants.map((variant) => {
        const meta = [
          formatCents(variant.priceCents, product.currency),
          variant.sku ? `SKU ${variant.sku}` : null,
          variant.isActive ? null : "Hidden",
        ].filter((part): part is string => Boolean(part));
        const warn = variant.stockQuantity <= 0;
        return (
          <View key={variant.id} style={styles.row}>
            <View style={styles.text}>
              <Text style={styles.label}>{variant.label}</Text>
              <Text style={[styles.meta, warn && styles.warn]}>
                {warn ? "Sold out · " : ""}
                {meta.join(" · ")}
              </Text>
            </View>
            <StockStepper
              key={variant.stockQuantity}
              value={variant.stockQuantity}
              saving={savingId === variant.id}
              onSave={(quantity) =>
                setStock.mutate(
                  { variantId: variant.id, quantity },
                  {
                    onError: (error) =>
                      Alert.alert("Couldn't save stock", error.message),
                  },
                )
              }
            />
          </View>
        );
      })}
      <Text style={styles.note}>
        Change variant prices and options on the web.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  text: { gap: 2 },
  label: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  warn: { color: colors.danger },
  note: { color: colors.muted, fontSize: 13, marginTop: spacing.sm },
});
