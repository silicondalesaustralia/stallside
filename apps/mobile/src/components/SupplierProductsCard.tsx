import { StyleSheet, Text, View } from "react-native";
import type { MobileSupplierProduct } from "@contracts/mobile/suppliers";
import { supplierProductMeta, supplierProductTag } from "@/lib/supplier-labels";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Props = { products: MobileSupplierProduct[] };

export default function SupplierProductsCard({ products }: Props) {
  return (
    <Card title="Products">
      {products.length === 0 ? (
        <Text style={styles.meta}>No products yet.</Text>
      ) : null}
      {products.map((product) => {
        const tag = supplierProductTag(product);
        return (
          <View key={product.id} style={styles.row}>
            <Text style={styles.name}>
              {product.name}
              {tag ? <Text style={styles.tag}> · {tag}</Text> : null}
            </Text>
            <Text style={styles.meta}>{supplierProductMeta(product)}</Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  tag: { color: colors.muted, fontWeight: "400" },
  meta: { color: colors.muted, fontSize: 13 },
});
