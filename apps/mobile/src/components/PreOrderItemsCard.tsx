import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { PreOrderDetailResponse } from "@contracts/mobile/preorders";
import { formatCents } from "@/lib/format";
import { openProduct } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

function stockLabel(stock: number | null): string {
  if (stock == null) return "Stock not tracked";
  return stock > 0 ? `${stock} left` : "Sold out";
}

/** Products on the page in page order; tap one to open it. */
export default function PreOrderItemsCard({
  detail,
}: {
  detail: PreOrderDetailResponse;
}) {
  const { items } = detail;
  return (
    <Card title={`Products (${items.length})`}>
      {items.length === 0 ? (
        <Text style={styles.empty}>
          No products on this page yet. Add some on the web.
        </Text>
      ) : null}
      {items.map((item) => (
        <Pressable
          key={item.productId}
          accessibilityRole="button"
          onPress={() => openProduct(item.productId)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumb} />
          )}
          <View style={styles.body}>
            <Text style={styles.name}>
              {item.name}
              {item.hidden ? <Text style={styles.meta}> · hidden</Text> : null}
            </Text>
            <Text style={item.stock === 0 ? styles.soldOut : styles.meta}>
              {formatCents(item.priceCents, detail.currency)} ·{" "}
              {stockLabel(item.stock)}
            </Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.7 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13, fontWeight: "400" },
  soldOut: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
