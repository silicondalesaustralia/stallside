import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import type { TaxSettingsResponse } from "@contracts/mobile/tax";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Props = {
  taxName: string;
  products: TaxSettingsResponse["taxFreeProducts"];
  total: number;
};

/** Products marked tax-free; each opens its product screen. */
export default function TaxFreeProductsCard({
  taxName,
  products,
  total,
}: Props) {
  return (
    <Card title={`${taxName}-free products`}>
      <Text style={styles.muted}>
        Fresh produce and other exempt or zero-rated goods. Turn this on from
        each product on the web.
      </Text>
      {products.length === 0 ? (
        <Text style={styles.text}>No products are marked {taxName}-free.</Text>
      ) : (
        products.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/product/[productId]",
                params: { productId: p.id },
              })
            }
            style={styles.row}
          >
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.muted}>{p.standName}</Text>
          </Pressable>
        ))
      )}
      {total > products.length ? (
        <Text style={styles.muted}>and {total - products.length} more</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  name: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
  text: { color: colors.text, fontSize: 14 },
  muted: { color: colors.muted, fontSize: 13 },
});
