import { Image, StyleSheet, Text, View } from "react-native";
import type { MobileProductDetail } from "@contracts/mobile/product-detail";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ProductStatusPill from "@/components/ProductStatusPill";

export default function ProductSummaryCard({ product }: { product: MobileProductDetail }) {
  const facts = [
    product.standName,
    product.sku ? `SKU ${product.sku}` : null,
    product.upc ? `Barcode ${product.upc}` : null,
    product.supplierName ? `Supplier: ${product.supplierName}` : null,
    product.isPreOrder ? "Pre-order" : null,
  ].filter((fact): fact is string => Boolean(fact));
  const onSale = product.compareAtPriceCents != null && product.compareAtPriceCents > product.priceCents;

  return (
    <Card>
      <View style={styles.top}>
        {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : null}
        <View style={styles.text}>
          <ProductStatusPill status={product.status} />
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceLine}>
            <Text style={styles.price}>{formatCents(product.priceCents, product.currency)}</Text>
            {onSale && product.compareAtPriceCents != null ? (
              <Text style={styles.was}>{formatCents(product.compareAtPriceCents, product.currency)}</Text>
            ) : null}
          </View>
        </View>
      </View>
      <Text style={styles.meta}>{facts.join(" · ")}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", gap: spacing.md },
  image: { width: 84, height: 84, borderRadius: 12, backgroundColor: colors.background },
  text: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontSize: 20, fontWeight: "700" },
  priceLine: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  price: { color: colors.text, fontSize: 18, fontWeight: "700" },
  was: { color: colors.muted, fontSize: 14, textDecorationLine: "line-through" },
  meta: { color: colors.muted, fontSize: 13 },
});
